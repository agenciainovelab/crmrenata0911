import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCache } from "@/lib/redis";
import bcrypt from "bcrypt";
import { z } from "zod";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = "usuarios:all";

// Schema de validação para atualização
const usuarioUpdateSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  telefone: z.string().optional(),
  senhaAtual: z.string().optional(),
  senhaNova: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LIDER", "PESSOA"]).optional(),
});

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        foto: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            eleitores: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const usuarioFormatado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      foto: usuario.foto,
      cadastradosTotal: usuario._count.eleitores,
      dataCadastro: usuario.createdAt.toISOString(),
      dataAtualizacao: usuario.updatedAt.toISOString(),
    };

    return NextResponse.json(usuarioFormatado);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validar dados
    const validatedData = usuarioUpdateSchema.parse(body);

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Se está alterando email, verificar se já existe
    if (validatedData.email && validatedData.email !== usuarioExistente.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExiste) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (validatedData.nome) updateData.nome = validatedData.nome;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.telefone !== undefined) updateData.telefone = validatedData.telefone;
    if (validatedData.role) updateData.role = validatedData.role;

    // Se há senha nova, verificar senha atual e gerar hash
    if (validatedData.senhaNova) {
      if (!validatedData.senhaAtual) {
        return NextResponse.json(
          { error: "Senha atual é obrigatória para alterar a senha" },
          { status: 400 }
        );
      }

      // Verificar senha atual
      const senhaCorreta = await bcrypt.compare(
        validatedData.senhaAtual,
        usuarioExistente.senhaHash
      );

      if (!senhaCorreta) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 400 }
        );
      }

      updateData.senhaHash = await bcrypt.hash(validatedData.senhaNova, 10);
    }

    // Se há senha (compatibilidade com código antigo)
    if (validatedData.senha && !validatedData.senhaNova) {
      updateData.senhaHash = await bcrypt.hash(validatedData.senha, 10);
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        foto: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidar cache
    await deleteCache(CACHE_KEY);

    return NextResponse.json(usuario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            eleitores: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há eleitores cadastrados
    if (usuario._count.eleitores > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Este usuário possui ${usuario._count.eleitores} eleitor(es) cadastrado(s).`,
        },
        { status: 400 }
      );
    }

    // Excluir usuário
    await prisma.usuario.delete({
      where: { id },
    });

    // Invalidar cache
    await deleteCache(CACHE_KEY);

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}
