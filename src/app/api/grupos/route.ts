import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const grupoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  ativo: z.boolean().default(true),
});

// GET - Listar todos os grupos
export async function GET() {
  try {
    const grupos = await prisma.grupo.findMany({
      include: {
        _count: {
          select: {
            subgrupos: true,
            eleitores: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(grupos);
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar grupos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = grupoSchema.parse(body);

    const grupo = await prisma.grupo.create({
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

    return NextResponse.json(grupo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar grupo' },
      { status: 500 }
    );
  }
}
