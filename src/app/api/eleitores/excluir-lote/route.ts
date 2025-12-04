import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCachePattern } from '@/lib/redis';

// Chave base para cache de eleitores
const CACHE_KEY_PREFIX = 'eleitores';

// POST - Excluir eleitores em lote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ID fornecido para exclusão' },
        { status: 400 }
      );
    }

    // Limitar exclusão a 500 registros por vez para evitar timeout
    if (ids.length > 500) {
      return NextResponse.json(
        { error: 'Máximo de 500 registros por exclusão' },
        { status: 400 }
      );
    }

    // Excluir eleitores em lote
    const result = await prisma.eleitor.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // Invalidar cache
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após exclusão em lote`);

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} eleitor(es) excluído(s) com sucesso`,
    });
  } catch (error: any) {
    console.error('Erro ao excluir eleitores em lote:', error);

    return NextResponse.json(
      { error: 'Erro ao excluir eleitores' },
      { status: 500 }
    );
  }
}
