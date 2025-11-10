"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Mail, Bell, Send, CheckCircle, Clock } from "lucide-react";

interface CanalStats {
  canal: string;
  icon: any;
  totalEnviados: number;
  totalPendentes: number;
  taxaAbertura: string;
  color: string;
}

const mockStats: CanalStats[] = [
  {
    canal: "WhatsApp",
    icon: MessageSquare,
    totalEnviados: 3450,
    totalPendentes: 120,
    taxaAbertura: "92%",
    color: "green",
  },
  {
    canal: "E-mail Marketing",
    icon: Mail,
    totalEnviados: 8920,
    totalPendentes: 450,
    taxaAbertura: "68%",
    color: "blue",
  },
  {
    canal: "Push Notification",
    icon: Bell,
    totalEnviados: 12350,
    totalPendentes: 0,
    taxaAbertura: "45%",
    color: "purple",
  },
];

const colorClasses: Record<string, string> = {
  green: "bg-green/10 text-green border-green",
  blue: "bg-political-blue/10 text-political-blue border-political-blue",
  purple: "bg-primary/10 text-primary border-primary",
};

export default function ComunicacaoPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<CanalStats[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            setStats(mockStats);
          }, 300);
          return 100;
        }
        return prev + 33;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-3 dark:bg-dark-3"></div>
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-primary">
          Carregando comunicação {progress}%
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white">Comunicação</h1>
        <p className="mt-2 text-dark-5 dark:text-dark-6">
          Gerencie todos os canais de comunicação da campanha
        </p>
      </div>

      {/* Cards de Canais */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.canal}
              className={`rounded-xl border-2 bg-white p-6 shadow-card transition-all hover:shadow-card-2 dark:bg-gray-dark ${
                colorClasses[stat.color]
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-dark dark:text-white">
                  {stat.canal}
                </h3>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    colorClasses[stat.color]
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-1 p-4 dark:bg-dark-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green" />
                    <span className="text-sm font-medium text-dark-5 dark:text-dark-6">
                      Enviados
                    </span>
                  </div>
                  <span className="text-xl font-bold text-dark dark:text-white">
                    {stat.totalEnviados.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-1 p-4 dark:bg-dark-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-dark" />
                    <span className="text-sm font-medium text-dark-5 dark:text-dark-6">
                      Pendentes
                    </span>
                  </div>
                  <span className="text-xl font-bold text-dark dark:text-white">
                    {stat.totalPendentes.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-1 p-4 dark:bg-dark-2">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-political-blue" />
                    <span className="text-sm font-medium text-dark-5 dark:text-dark-6">
                      Taxa de Abertura
                    </span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {stat.taxaAbertura}
                  </span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-white transition hover:bg-opacity-90">
                Enviar {stat.canal}
              </button>
            </div>
          );
        })}
      </div>

      {/* Histórico Recente */}
      <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
        <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
          Histórico Recente de Envios
        </h3>
        <div className="space-y-4">
          {[
            {
              canal: "WhatsApp",
              mensagem: "Lembrete de votação - Dia 15/11",
              destinatarios: 128,
              data: "09/11/2025 14:30",
              status: "Enviado",
            },
            {
              canal: "E-mail",
              mensagem: "Newsletter Semanal - Novidades da Campanha",
              destinatarios: 890,
              data: "08/11/2025 09:00",
              status: "Enviado",
            },
            {
              canal: "Push",
              mensagem: "Nova pesquisa disponível",
              destinatarios: 1250,
              data: "07/11/2025 18:45",
              status: "Enviado",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {item.canal}
                  </span>
                  <h4 className="font-semibold text-dark dark:text-white">
                    {item.mensagem}
                  </h4>
                </div>
                <p className="mt-2 text-sm text-dark-5 dark:text-dark-6">
                  {item.destinatarios} destinatários • {item.data}
                </p>
              </div>
              <span className="rounded-full bg-green/10 px-4 py-1.5 text-sm font-medium text-green">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
