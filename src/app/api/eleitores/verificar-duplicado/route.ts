import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Verificar duplicados por CPF ou telefone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, telefone } = body;

    if (!cpf && !telefone) {
      return NextResponse.json(
        { error: 'CPF ou telefone são obrigatórios' },
        { status: 400 }
      );
    }

    const conditions = [];

    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length === 11) {
        conditions.push({ cpf: cpfLimpo });
      }
    }

    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length >= 10) {
        conditions.push({ telefone: { contains: telefoneLimpo } });
      }
    }

    if (conditions.length === 0) {
      return NextResponse.json({ duplicados: [], hasDuplicado: false });
    }

    // Buscar eleitores com CPF ou telefone igual
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
        dataNascimento: true,
        genero: true,
        escolaridade: true,
        cidade: true,
        uf: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        grupoId: true,
        subgrupoId: true,
        grupo: {
          select: {
            id: true,
            nome: true,
          },
        },
        subgrupo: {
          select: {
            id: true,
            nome: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      duplicados,
      hasDuplicado: duplicados.length > 0,
    });
  } catch (error) {
    console.error('Erro ao verificar duplicados:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar duplicados' },
      { status: 500 }
    );
  }
}
