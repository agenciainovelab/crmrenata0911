import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subgrupoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional(),
  grupoId: z.string().uuid('ID do grupo inválido'),
  responsavelId: z.string().uuid('ID do responsável inválido'),
  ativo: z.boolean().default(true),
});

// GET - Listar todos os subgrupos (com filtro opcional por grupo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grupoId = searchParams.get('grupoId');

    const where = grupoId ? { grupoId } : {};

    const subgrupos = await prisma.subgrupo.findMany({
      where,
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
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(subgrupos);
  } catch (error) {
    console.error('Erro ao listar subgrupos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar subgrupos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo subgrupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subgrupoSchema.parse(body);

    // Verificar se o grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id: validatedData.grupoId },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o responsável existe
    const responsavel = await prisma.usuario.findUnique({
      where: { id: validatedData.responsavelId },
    });

    if (!responsavel) {
      return NextResponse.json(
        { error: 'Responsável não encontrado' },
        { status: 404 }
      );
    }

    const subgrupo = await prisma.subgrupo.create({
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

    return NextResponse.json(subgrupo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao criar subgrupo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar subgrupo' },
      { status: 500 }
    );
  }
}
