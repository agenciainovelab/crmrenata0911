import { NextRequest, NextResponse } from 'next/server';
import { flushAllCache, getCacheStats } from '@/lib/redis';

// POST - Limpar todo o cache
export async function POST(request: NextRequest) {
  try {
    const success = await flushAllCache();
    
    if (success) {
      return NextResponse.json({
        message: 'Todo o cache foi limpo com sucesso',
        success: true,
      });
    }
    
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
      { status: 500 }
    );
  }
}

// GET - Obter estatísticas do cache
export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats();
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Erro ao obter estatísticas do cache' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error);
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas do cache' },
      { status: 500 }
    );
  }
}
