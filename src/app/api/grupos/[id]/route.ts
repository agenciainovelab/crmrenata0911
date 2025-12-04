import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const grupoUpdateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar grupo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subgrupos: true,
            eleitores: true,
          },
        },
        subgrupos: {
          include: {
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            _count: {
              select: {
                eleitores: true,
              },
            },
          },
        },
      },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(grupo);
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar grupo' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = grupoUpdateSchema.parse(body);

    // Verificar se o grupo existe
    const grupoExistente = await prisma.grupo.findUnique({
      where: { id },
    });

    if (!grupoExistente) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    const grupo = await prisma.grupo.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            subgrupos: true,
            eleitores: true,
          },
        },
      },
    });

    return NextResponse.json(grupo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar grupo' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar se o grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subgrupos: true,
            eleitores: true,
          },
        },
      },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há eleitores vinculados diretamente
    if (grupo._count.eleitores > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir grupo com eleitores vinculados',
          details: `Este grupo possui ${grupo._count.eleitores} eleitor(es) vinculado(s)`
        },
        { status: 400 }
      );
    }

    // Verificar se há subgrupos (eles serão excluídos em cascata)
    if (grupo._count.subgrupos > 0) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir grupo com subgrupos',
          details: `Este grupo possui ${grupo._count.subgrupos} subgrupo(s). Exclua os subgrupos primeiro.`
        },
        { status: 400 }
      );
    }

    await prisma.grupo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Grupo excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir grupo' },
      { status: 500 }
    );
  }
}
