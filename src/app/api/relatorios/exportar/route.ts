import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Exportar relatório em CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tipo = 'eleitores', // eleitores, aquecidos, exportados, grupos, cidades
      periodo = 'all',
      grupoId = '',
      subgrupoId = '',
      cidade = '',
      bairro = '',
      formato = 'csv', // csv ou json
    } = body;

    // Calcular data de início baseado no período
    const now = new Date();
    let dataInicio: Date | null = null;

    switch (periodo) {
      case '1m':
        dataInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case '3m':
        dataInicio = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6m':
        dataInicio = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '12m':
        dataInicio = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        dataInicio = null;
    }

    // Construir filtro where
    const where: any = {};

    if (dataInicio) {
      where.createdAt = { gte: dataInicio };
    }
    if (grupoId) {
      where.grupoId = grupoId;
    }
    if (subgrupoId) {
      where.subgrupoId = subgrupoId;
    }
    if (cidade) {
      where.cidade = { contains: cidade, mode: 'insensitive' };
    }
    if (bairro) {
      where.bairro = { contains: bairro, mode: 'insensitive' };
    }

    // Filtros específicos por tipo
    if (tipo === 'aquecidos') {
      where.aquecido = true;
    } else if (tipo === 'nao_aquecidos') {
      where.aquecido = false;
    } else if (tipo === 'exportados') {
      where.exportado = true;
    } else if (tipo === 'nao_exportados') {
      where.exportado = false;
    }

    // Buscar dados
    const eleitores = await prisma.eleitor.findMany({
      where,
      select: {
        nomeCompleto: true,
        cpf: true,
        telefone: true,
        email: true,
        dataNascimento: true,
        genero: true,
        cidade: true,
        uf: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        aquecido: true,
        aquecidoEm: true,
        exportado: true,
        exportadoEm: true,
        createdAt: true,
        grupo: {
          select: { nome: true },
        },
        subgrupo: {
          select: { nome: true },
        },
        criadoPor: {
          select: { nome: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (formato === 'json') {
      return NextResponse.json({
        total: eleitores.length,
        dados: eleitores,
      });
    }

    // Gerar CSV
    const headers = [
      'Nome Completo',
      'CPF',
      'Telefone',
      'Email',
      'Data Nascimento',
      'Genero',
      'Cidade',
      'UF',
      'Bairro',
      'Logradouro',
      'Numero',
      'CEP',
      'Grupo',
      'Subgrupo',
      'Aquecido',
      'Data Aquecimento',
      'Exportado',
      'Data Exportacao',
      'Cadastrado Por',
      'Data Cadastro',
    ];

    const generoMap: Record<string, string> = {
      MASCULINO: 'Masculino',
      FEMININO: 'Feminino',
      OUTRO: 'Outro',
      NAO_INFORMAR: 'Não Informar',
    };

    const rows = eleitores.map((e) => [
      e.nomeCompleto || '',
      e.cpf || '',
      e.telefone || '',
      e.email || '',
      e.dataNascimento ? new Date(e.dataNascimento).toLocaleDateString('pt-BR') : '',
      generoMap[e.genero] || e.genero,
      e.cidade || '',
      e.uf || '',
      e.bairro || '',
      e.logradouro || '',
      e.numero || '',
      e.cep || '',
      e.grupo?.nome || '',
      e.subgrupo?.nome || '',
      e.aquecido ? 'Sim' : 'Não',
      e.aquecidoEm ? new Date(e.aquecidoEm).toLocaleDateString('pt-BR') : '',
      e.exportado ? 'Sim' : 'Não',
      e.exportadoEm ? new Date(e.exportadoEm).toLocaleDateString('pt-BR') : '',
      e.criadoPor?.nome || '',
      e.createdAt ? new Date(e.createdAt).toLocaleDateString('pt-BR') : '',
    ]);

    // Escapar valores para CSV
    const escapeCSV = (value: string) => {
      if (value.includes(';') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(';')),
    ].join('\n');

    // Criar nome do arquivo
    const tipoNome = {
      eleitores: 'todos_eleitores',
      aquecidos: 'eleitores_aquecidos',
      nao_aquecidos: 'eleitores_nao_aquecidos',
      exportados: 'eleitores_exportados',
      nao_exportados: 'eleitores_nao_exportados',
    }[tipo] || 'relatorio';

    const dataExport = new Date().toISOString().split('T')[0];
    const nomeArquivo = `${tipoNome}_${dataExport}.csv`;

    return NextResponse.json({
      success: true,
      total: eleitores.length,
      nomeArquivo,
      csv: csvContent,
    });
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar relatório' },
      { status: 500 }
    );
  }
}
