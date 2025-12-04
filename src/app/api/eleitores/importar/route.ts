import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCachePattern } from '@/lib/redis';

// Chave base para cache de eleitores
const CACHE_KEY_PREFIX = 'eleitores';

// POST - Importar eleitores em lote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eleitores } = body;

    if (!eleitores || !Array.isArray(eleitores) || eleitores.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum eleitor para importar' },
        { status: 400 }
      );
    }

    // Limitar importação a 500 registros por vez
    if (eleitores.length > 500) {
      return NextResponse.json(
        { error: 'Máximo de 500 registros por importação' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    const errors: string[] = [];
    eleitores.forEach((eleitor, index) => {
      if (!eleitor.nomeCompleto) {
        errors.push(`Linha ${index + 1}: Nome completo é obrigatório`);
      }
      if (!eleitor.telefone) {
        errors.push(`Linha ${index + 1}: Telefone é obrigatório`);
      }
      if (!eleitor.cidade) {
        errors.push(`Linha ${index + 1}: Cidade é obrigatória`);
      }
      if (!eleitor.criadoPorId) {
        errors.push(`Linha ${index + 1}: ID do criador é obrigatório`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Erros de validação', details: errors.slice(0, 10) },
        { status: 400 }
      );
    }

    // Preparar dados para inserção
    const dataToInsert = eleitores.map((eleitor) => ({
      nomeCompleto: eleitor.nomeCompleto,
      cpf: eleitor.cpf || null,
      telefone: eleitor.telefone,
      email: eleitor.email || null,
      dataNascimento: eleitor.dataNascimento ? new Date(eleitor.dataNascimento) : new Date(),
      genero: eleitor.genero || 'NAO_INFORMAR',
      escolaridade: eleitor.escolaridade || 'MEDIO_COMPLETO',
      cep: eleitor.cep || null,
      logradouro: eleitor.logradouro || null,
      numero: eleitor.numero || null,
      complemento: eleitor.complemento || null,
      bairro: eleitor.bairro || 'Centro',
      cidade: eleitor.cidade,
      uf: eleitor.uf || 'SP',
      zonaEleitoral: eleitor.zonaEleitoral || null,
      secao: eleitor.secao || null,
      criadoPorId: eleitor.criadoPorId,
      origem: eleitor.origem || 'importacao',
      grupoId: eleitor.grupoId || null,
      subgrupoId: eleitor.subgrupoId || null,
    }));

    // Inserir em lote usando createMany
    const result = await prisma.eleitor.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Pular CPFs duplicados
    });

    // Invalidar cache
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após importação`);

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} eleitor(es) importado(s) com sucesso`,
    });
  } catch (error: any) {
    console.error('Erro ao importar eleitores:', error);

    // Tratar erro de chave duplicada
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Alguns CPFs já estão cadastrados no sistema' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao importar eleitores' },
      { status: 500 }
    );
  }
}
