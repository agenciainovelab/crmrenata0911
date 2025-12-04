import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obter estatísticas do dashboard
export async function GET() {
  try {
    // Buscar contagens por role de usuário e total de eleitores em paralelo
    const [
      superAdmins,
      admins,
      lideres,
      totalEleitores,
      eleitoresHoje,
      eleitoresSemana,
      eleitoresMes,
      gruposAtivos,
      subgruposAtivos,
      eventosAtivos,
      ultimosEleitores,
      crescimentoMensal,
    ] = await Promise.all([
      // Contagem de Super Admins
      prisma.usuario.count({ where: { role: 'SUPER_ADMIN' } }),
      // Contagem de Admins
      prisma.usuario.count({ where: { role: 'ADMIN' } }),
      // Contagem de Líderes
      prisma.usuario.count({ where: { role: 'LIDER' } }),
      // Total de eleitores
      prisma.eleitor.count(),
      // Eleitores cadastrados hoje
      prisma.eleitor.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      // Eleitores cadastrados na última semana
      prisma.eleitor.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Eleitores cadastrados no último mês
      prisma.eleitor.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Grupos ativos
      prisma.grupo.count({ where: { ativo: true } }),
      // Subgrupos ativos
      prisma.subgrupo.count({ where: { ativo: true } }),
      // Eventos ativos
      prisma.eventoPresenca.count({ where: { ativo: true } }),
      // Últimos 5 eleitores cadastrados
      prisma.eleitor.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nomeCompleto: true,
          cidade: true,
          createdAt: true,
          criadoPor: {
            select: {
              nome: true,
            },
          },
        },
      }),
      // Crescimento mensal (últimos 6 meses)
      getCrescimentoMensal(),
    ]);

    // Calcular tendências (comparando com período anterior)
    const mesPosterior = await prisma.eleitor.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const crescimentoMesAtual = eleitoresMes - mesPosterior;
    const percentualCrescimento = mesPosterior > 0
      ? Math.round((crescimentoMesAtual / mesPosterior) * 100)
      : 100;

    return NextResponse.json({
      // Cards principais
      stats: {
        superAdmins,
        admins,
        lideres,
        totalEleitores,
      },
      // Tendências
      tendencias: {
        eleitoresHoje,
        eleitoresSemana,
        eleitoresMes,
        crescimentoMesAtual,
        percentualCrescimento,
      },
      // Contadores gerais
      contadores: {
        gruposAtivos,
        subgruposAtivos,
        eventosAtivos,
      },
      // Dados para gráfico
      crescimentoMensal,
      // Últimas atividades
      ultimasAtividades: ultimosEleitores.map((e) => ({
        id: e.id,
        tipo: 'novo_cadastro',
        titulo: 'Novo eleitor',
        descricao: `${e.nomeCompleto} de ${e.cidade}`,
        por: e.criadoPor?.nome || 'Sistema',
        tempo: formatarTempo(e.createdAt),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}

// Função para obter crescimento mensal
async function getCrescimentoMensal() {
  const meses = [];
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
    const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59);

    const [eleitores, admins, lideres] = await Promise.all([
      prisma.eleitor.count({
        where: {
          createdAt: {
            lte: fimMes,
          },
        },
      }),
      prisma.usuario.count({
        where: {
          role: 'ADMIN',
          createdAt: {
            lte: fimMes,
          },
        },
      }),
      prisma.usuario.count({
        where: {
          role: 'LIDER',
          createdAt: {
            lte: fimMes,
          },
        },
      }),
    ]);

    meses.push({
      mes: nomesMeses[data.getMonth()],
      admins,
      lideres,
      pessoas: eleitores,
    });
  }

  return meses;
}

// Função para formatar tempo relativo
function formatarTempo(data: Date): string {
  const agora = new Date();
  const diff = agora.getTime() - new Date(data).getTime();

  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Agora';
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  if (dias === 1) return 'Ontem';
  return `${dias} dias atrás`;
}
