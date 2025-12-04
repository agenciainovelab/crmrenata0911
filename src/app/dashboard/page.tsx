"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserCog, TrendingUp, Building2, Layers, Calendar } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import GrowthChart from "@/components/Dashboard/GrowthChart";
import Notifications from "@/components/Dashboard/Notifications";

interface DashboardStats {
  stats: {
    superAdmins: number;
    admins: number;
    lideres: number;
    totalEleitores: number;
  };
  tendencias: {
    eleitoresHoje: number;
    eleitoresSemana: number;
    eleitoresMes: number;
    crescimentoMesAtual: number;
    percentualCrescimento: number;
  };
  contadores: {
    gruposAtivos: number;
    subgruposAtivos: number;
    eventosAtivos: number;
  };
  crescimentoMensal: Array<{
    mes: string;
    admins: number;
    lideres: number;
    pessoas: number;
  }>;
  ultimasAtividades: Array<{
    id: string;
    tipo: string;
    titulo: string;
    descricao: string;
    por: string;
    tempo: string;
  }>;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const stats = await response.json();
          setData(stats);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Visão geral da campanha política
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || { superAdmins: 0, admins: 0, lideres: 0, totalEleitores: 0 };
  const tendencias = data?.tendencias || { eleitoresMes: 0, percentualCrescimento: 0, eleitoresHoje: 0, eleitoresSemana: 0 };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-dark-5 dark:text-dark-6">
          Visão geral da campanha política
        </p>
      </div>

      {/* Cards de Estatísticas - Usuários */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={UserCog}
          color="purple"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={UserCheck}
          color="purple"
        />
        <StatsCard
          title="Líderes"
          value={stats.lideres}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Eleitores"
          value={stats.totalEleitores}
          icon={TrendingUp}
          trend={{
            value: `+${tendencias.eleitoresMes} este mês`,
            isPositive: tendencias.eleitoresMes > 0,
          }}
          color="blue"
        />
      </div>

      {/* Cards secundários */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-dark-5 dark:text-dark-6">Grupos Ativos</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {data?.contadores.gruposAtivos || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-dark-5 dark:text-dark-6">Subgrupos Ativos</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {data?.contadores.subgruposAtivos || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-dark-5 dark:text-dark-6">Eventos Ativos</p>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {data?.contadores.eventosAtivos || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de crescimento */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <p className="text-sm opacity-80">Cadastros Hoje</p>
          <p className="text-3xl font-bold">{tendencias.eleitoresHoje}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <p className="text-sm opacity-80">Cadastros na Semana</p>
          <p className="text-3xl font-bold">{tendencias.eleitoresSemana}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <p className="text-sm opacity-80">Cadastros no Mês</p>
          <p className="text-3xl font-bold">{tendencias.eleitoresMes}</p>
          {tendencias.percentualCrescimento !== 0 && (
            <p className="mt-1 text-sm opacity-80">
              {tendencias.percentualCrescimento > 0 ? '+' : ''}
              {tendencias.percentualCrescimento}% vs mês anterior
            </p>
          )}
        </div>
      </div>

      {/* Gráfico e Notificações */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GrowthChart data={data?.crescimentoMensal} />
        </div>
        <div>
          <Notifications atividades={data?.ultimasAtividades} />
        </div>
      </div>
    </div>
  );
}
