import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Verificar duplicados em lote por CPFs e telefones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpfs, telefones } = body;

    if ((!cpfs || cpfs.length === 0) && (!telefones || telefones.length === 0)) {
      return NextResponse.json({ duplicados: [] });
    }

    const conditions = [];

    // Filtrar e limpar CPFs válidos
    if (cpfs && cpfs.length > 0) {
      const cpfsLimpos = cpfs
        .map((cpf: string) => cpf?.replace(/\D/g, ''))
        .filter((cpf: string) => cpf && cpf.length === 11);

      if (cpfsLimpos.length > 0) {
        conditions.push({ cpf: { in: cpfsLimpos } });
      }
    }

    // Filtrar e limpar telefones válidos
    if (telefones && telefones.length > 0) {
      const telefonesLimpos = telefones
        .map((tel: string) => tel?.replace(/\D/g, ''))
        .filter((tel: string) => tel && tel.length >= 10);

      if (telefonesLimpos.length > 0) {
        conditions.push({ telefone: { in: telefonesLimpos } });
      }
    }

    if (conditions.length === 0) {
      return NextResponse.json({ duplicados: [] });
    }

    // Buscar eleitores existentes com CPF ou telefone igual
    const duplicados = await prisma.eleitor.findMany({
      where: {
        OR: conditions,
      },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        telefone: true,
        email: true,
        cidade: true,
        uf: true,
      },
    });

    return NextResponse.json({ duplicados });
  } catch (error) {
    console.error('Erro ao verificar duplicados em lote:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar duplicados' },
      { status: 500 }
    );
  }
}
