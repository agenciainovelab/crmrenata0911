import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, deleteCache } from "@/lib/redis";
import bcrypt from "bcrypt";
import { z } from "zod";

const CACHE_KEY = "usuarios:all";
const CACHE_TTL = 60; // 1 minuto

// Schema de validação
const usuarioCreateSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LIDER", "PESSOA"]),
});

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    // Tentar buscar do cache
    const cached = await getCache(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Buscar do banco
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            eleitores: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapear para o formato esperado
    const usuariosFormatados = usuarios.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      cadastradosTotal: user._count.eleitores,
      dataCadastro: user.createdAt.toISOString(),
      dataAtualizacao: user.updatedAt.toISOString(),
    }));

    // Salvar no cache
    await setCache(CACHE_KEY, JSON.stringify(usuariosFormatados), CACHE_TTL);

    return NextResponse.json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validatedData = usuarioCreateSchema.parse(body);

    // Verificar se email já existe
    const existente = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(validatedData.senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        senhaHash,
        role: validatedData.role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidar cache
    await deleteCache(CACHE_KEY);

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
