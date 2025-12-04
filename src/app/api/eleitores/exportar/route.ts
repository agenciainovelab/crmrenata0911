import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCachePattern } from '@/lib/redis';

// POST - Marcar eleitores como exportados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs dos eleitores são obrigatórios' },
        { status: 400 }
      );
    }

    // Atualizar eleitores como exportados
    const result = await prisma.eleitor.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        exportado: true,
        exportadoEm: new Date(),
      },
    });

    // Invalidar cache
    await deleteCachePattern('eleitores:*');

    return NextResponse.json({
      message: `${result.count} eleitor(es) marcado(s) como exportado(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error('Erro ao marcar eleitores como exportados:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar eleitores como exportados' },
      { status: 500 }
    );
  }
}
