import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar dados para relatórios
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || '6m'; // 1m, 3m, 6m, 12m, all
    const grupoId = searchParams.get('grupoId') || '';
    const subgrupoId = searchParams.get('subgrupoId') || '';
    const cidade = searchParams.get('cidade') || '';
    const bairro = searchParams.get('bairro') || '';

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

    // Buscar estatísticas em paralelo
    const [
      totalEleitores,
      eleitoresAquecidos,
      eleitoresExportados,
      eleitoresPorCidade,
      eleitoresPorBairro,
      eleitoresPorGrupo,
      cadastrosPorMes,
      usuarios,
      grupos,
    ] = await Promise.all([
      // Total de eleitores
      prisma.eleitor.count({ where }),

      // Eleitores aquecidos
      prisma.eleitor.count({ where: { ...where, aquecido: true } }),

      // Eleitores exportados
      prisma.eleitor.count({ where: { ...where, exportado: true } }),

      // Eleitores por cidade (top 10)
      prisma.eleitor.groupBy({
        by: ['cidade'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Eleitores por bairro (top 10)
      prisma.eleitor.groupBy({
        by: ['bairro'],
        where: { ...where, bairro: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Eleitores por grupo
      prisma.eleitor.groupBy({
        by: ['grupoId'],
        where: { ...where, grupoId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Cadastros por mês (últimos 6 meses)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as mes,
          EXTRACT(MONTH FROM "createdAt") as mes_num,
          EXTRACT(YEAR FROM "createdAt") as ano,
          COUNT(*)::int as cadastros
        FROM eleitores
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt"), EXTRACT(MONTH FROM "createdAt"), EXTRACT(YEAR FROM "createdAt")
        ORDER BY ano, mes_num
      `,

      // Contagem de usuários por role
      prisma.usuario.groupBy({
        by: ['role'],
        _count: { id: true },
      }),

      // Lista de grupos para referência
      prisma.grupo.findMany({
        select: { id: true, nome: true },
      }),
    ]);

    // Processar dados de cadastros por mês
    const mesesPtBr: Record<string, string> = {
      'Jan': 'Jan', 'Feb': 'Fev', 'Mar': 'Mar', 'Apr': 'Abr',
      'May': 'Mai', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Ago',
      'Sep': 'Set', 'Oct': 'Out', 'Nov': 'Nov', 'Dec': 'Dez'
    };

    const cadastrosMes = (cadastrosPorMes as any[]).map((item: any) => ({
      mes: mesesPtBr[item.mes] || item.mes,
      cadastros: item.cadastros,
    }));

    // Processar dados de usuários por role
    const usuariosPorRole: Record<string, number> = {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      LIDER: 0,
      PESSOA: 0,
    };

    usuarios.forEach((u: any) => {
      usuariosPorRole[u.role] = u._count.id;
    });

    // Processar eleitores por grupo (adicionar nome do grupo)
    const gruposMap = new Map(grupos.map(g => [g.id, g.nome]));
    const eleitoresPorGrupoComNome = eleitoresPorGrupo.map((g: any) => ({
      grupo: gruposMap.get(g.grupoId) || 'Sem nome',
      grupoId: g.grupoId,
      total: g._count.id,
    }));

    // Calcular estatísticas adicionais
    const eleitoresNaoAquecidos = totalEleitores - eleitoresAquecidos;
    const eleitoresNaoExportados = totalEleitores - eleitoresExportados;
    const taxaAquecimento = totalEleitores > 0 ? ((eleitoresAquecidos / totalEleitores) * 100).toFixed(1) : '0';
    const taxaExportacao = totalEleitores > 0 ? ((eleitoresExportados / totalEleitores) * 100).toFixed(1) : '0';

    // Calcular crescimento (comparando com mês anterior)
    const mesAtual = cadastrosMes[cadastrosMes.length - 1]?.cadastros || 0;
    const mesAnterior = cadastrosMes[cadastrosMes.length - 2]?.cadastros || 1;
    const crescimento = mesAnterior > 0 ? (((mesAtual - mesAnterior) / mesAnterior) * 100).toFixed(0) : '0';

    return NextResponse.json({
      // Estatísticas gerais
      totalEleitores,
      eleitoresAquecidos,
      eleitoresExportados,
      eleitoresNaoAquecidos,
      eleitoresNaoExportados,
      taxaAquecimento,
      taxaExportacao,
      crescimento: `${Number(crescimento) >= 0 ? '+' : ''}${crescimento}%`,

      // Usuários por role
      usuarios: usuariosPorRole,
      totalUsuarios: Object.values(usuariosPorRole).reduce((a, b) => a + b, 0),

      // Dados para gráficos
      cadastrosPorMes: cadastrosMes,
      eleitoresPorCidade: eleitoresPorCidade.map((c: any) => ({
        cidade: c.cidade || 'Não informado',
        total: c._count.id,
      })),
      eleitoresPorBairro: eleitoresPorBairro.map((b: any) => ({
        bairro: b.bairro || 'Não informado',
        total: b._count.id,
      })),
      eleitoresPorGrupo: eleitoresPorGrupoComNome,

      // Distribuição por tipo de usuário
      distribuicaoPorTipo: [
        { tipo: 'Super Admins', valor: usuariosPorRole.SUPER_ADMIN, cor: '#3A0CA3' },
        { tipo: 'Admins', valor: usuariosPorRole.ADMIN, cor: '#7B2CBF' },
        { tipo: 'Líderes', valor: usuariosPorRole.LIDER, cor: '#9D4EDD' },
        { tipo: 'Eleitores', valor: totalEleitores, cor: '#3B82F6' },
      ],

      // Status de aquecimento
      statusAquecimento: [
        { status: 'Aquecidos', valor: eleitoresAquecidos, cor: '#F97316' },
        { status: 'Não Aquecidos', valor: eleitoresNaoAquecidos, cor: '#94A3B8' },
      ],

      // Status de exportação
      statusExportacao: [
        { status: 'Exportados', valor: eleitoresExportados, cor: '#22C55E' },
        { status: 'Não Exportados', valor: eleitoresNaoExportados, cor: '#94A3B8' },
      ],
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatórios' },
      { status: 500 }
    );
  }
}
