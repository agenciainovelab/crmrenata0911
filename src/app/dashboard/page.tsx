"use client";

import { Users, UserCheck, UserCog, TrendingUp } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import GrowthChart from "@/components/Dashboard/GrowthChart";
import Notifications from "@/components/Dashboard/Notifications";

export default function Dashboard() {
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

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Super Admins"
          value={8}
          icon={UserCog}
          trend={{ value: "+2 este mês", isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Admins"
          value={35}
          icon={UserCheck}
          trend={{ value: "+7 este mês", isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Líderes"
          value={128}
          icon={Users}
          trend={{ value: "+23 este mês", isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Pessoas"
          value={890}
          icon={TrendingUp}
          trend={{ value: "+170 este mês", isPositive: true }}
          color="blue"
        />
      </div>

      {/* Gráfico e Notificações */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GrowthChart />
        </div>
        <div>
          <Notifications />
        </div>
      </div>
    </div>
  );
}
