import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCachePattern } from '@/lib/redis';

// Chave base para cache de eleitores
const CACHE_KEY_PREFIX = 'eleitores';

// POST - Marcar eleitores como aquecidos em lote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, aquecido = true } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ID fornecido' },
        { status: 400 }
      );
    }

    // Limitar a 500 registros por vez
    if (ids.length > 500) {
      return NextResponse.json(
        { error: 'Máximo de 500 registros por operação' },
        { status: 400 }
      );
    }

    // Atualizar eleitores em lote
    const result = await prisma.eleitor.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        aquecido: aquecido,
        aquecidoEm: aquecido ? new Date() : null,
      },
    });

    // Invalidar cache
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após marcar como aquecido`);

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} eleitor(es) ${aquecido ? 'marcado(s) como aquecido(s)' : 'desmarcado(s)'}`,
    });
  } catch (error: any) {
    console.error('Erro ao marcar eleitores como aquecidos:', error);

    return NextResponse.json(
      { error: 'Erro ao atualizar eleitores' },
      { status: 500 }
    );
  }
}
