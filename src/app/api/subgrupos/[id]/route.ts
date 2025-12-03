import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subgrupoUpdateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  descricao: z.string().optional(),
  grupoId: z.string().uuid('ID do grupo inválido').optional(),
  responsavelId: z.string().uuid('ID do responsável inválido').optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar subgrupo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subgrupo = await prisma.subgrupo.findUnique({
      where: { id: params.id },
      include: {
        grupo: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        _count: {
          select: {
            eleitores: true,
            eventosPresenca: true,
          },
        },
      },
    });

    if (!subgrupo) {
      return NextResponse.json(
        { error: 'Subgrupo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(subgrupo);
  } catch (error) {
    console.error('Erro ao buscar subgrupo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar subgrupo' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar subgrupo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = subgrupoUpdateSchema.parse(body);

    // Verificar se o subgrupo existe
    const subgrupoExistente = await prisma.subgrupo.findUnique({
      where: { id: params.id },
    });

    if (!subgrupoExistente) {
      return NextResponse.json(
        { error: 'Subgrupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o grupo existe (se fornecido)
    if (validatedData.grupoId) {
      const grupo = await prisma.grupo.findUnique({
        where: { id: validatedData.grupoId },
      });

      if (!grupo) {
        return NextResponse.json(
          { error: 'Grupo não encontrado' },
          { status: 404 }
        );
      }
    }

    // Verificar se o responsável existe (se fornecido)
    if (validatedData.responsavelId) {
      const responsavel = await prisma.usuario.findUnique({
        where: { id: validatedData.responsavelId },
      });

      if (!responsavel) {
        return NextResponse.json(
          { error: 'Responsável não encontrado' },
          { status: 404 }
        );
      }
    }

    const subgrupo = await prisma.subgrupo.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        grupo: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        _count: {
          select: {
            eleitores: true,
            eventosPresenca: true,
          },
        },
      },
    });

    return NextResponse.json(subgrupo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar subgrupo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar subgrupo' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir subgrupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o subgrupo existe
    const subgrupo = await prisma.subgrupo.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            eleitores: true,
            eventosPresenca: true,
          },
        },
      },
    });

    if (!subgrupo) {
      return NextResponse.json(
        { error: 'Subgrupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há eleitores vinculados
    if (subgrupo._count.eleitores > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir subgrupo com eleitores vinculados',
          details: `Este subgrupo possui ${subgrupo._count.eleitores} eleitor(es) vinculado(s)`
        },
        { status: 400 }
      );
    }

    // Excluir eventos de presença primeiro (cascade está no schema, mas por garantia)
    if (subgrupo._count.eventosPresenca > 0) {
      await prisma.eventoPresenca.deleteMany({
        where: { subgrupoId: params.id },
      });
    }

    await prisma.subgrupo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Subgrupo excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir subgrupo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir subgrupo' },
      { status: 500 }
    );
  }
}
