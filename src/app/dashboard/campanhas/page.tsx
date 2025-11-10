"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Mail, Phone, Calendar, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Campanha {
  id: number;
  nome: string;
  canal: "whatsapp" | "email" | "voz";
  publico: string;
  totalEnvios: number;
  dataEnvio: string;
  status: "agendada" | "enviando" | "concluida";
}

const mockCampanhas: Campanha[] = [
  {
    id: 1,
    nome: "Mobilização Final - Votação",
    canal: "whatsapp",
    publico: "Todos os Líderes",
    totalEnvios: 128,
    dataEnvio: "2025-11-15",
    status: "agendada",
  },
  {
    id: 2,
    nome: "Convite Evento Político",
    canal: "email",
    publico: "Admins e Super Admins",
    totalEnvios: 43,
    dataEnvio: "2025-11-10",
    status: "concluida",
  },
  {
    id: 3,
    nome: "Pesquisa de Opinião",
    canal: "voz",
    publico: "Pessoas cadastradas",
    totalEnvios: 890,
    dataEnvio: "2025-11-12",
    status: "enviando",
  },
];

const canalIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  voz: Phone,
};

const canalColors = {
  whatsapp: "bg-green/10 text-green",
  email: "bg-political-blue/10 text-political-blue",
  voz: "bg-primary/10 text-primary",
};

const statusLabels = {
  agendada: "Agendada",
  enviando: "Enviando",
  concluida: "Concluída",
};

const statusColors = {
  agendada: "bg-yellow-light-4 text-yellow-dark",
  enviando: "bg-political-blue/10 text-political-blue",
  concluida: "bg-green/10 text-green",
};

export default function CampanhasPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            setCampanhas(mockCampanhas);
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
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-3 dark:bg-dark-3"></div>
          ))}
        </div>
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-3 dark:bg-dark-3"></div>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-primary">
            Carregando campanhas {progress}%
          </div>
        </div>
      </div>
    );
  }

  const totalEnvios = campanhas.reduce((acc, c) => acc + c.totalEnvios, 0);
  const totalAgendadas = campanhas.filter((c) => c.status === "agendada").length;
  const totalConcluidas = campanhas.filter((c) => c.status === "concluida").length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Campanhas</h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Crie e gerencie campanhas políticas multicanal
          </p>
        </div>
        <Link
          href="/dashboard/campanhas/nova"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Nova Campanha
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
                Total de Envios
              </p>
              <h3 className="mt-2 text-3xl font-bold text-dark dark:text-white">
                {totalEnvios.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
                Campanhas Agendadas
              </p>
              <h3 className="mt-2 text-3xl font-bold text-dark dark:text-white">
                {totalAgendadas}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-light-4 text-yellow-dark">
              <Calendar className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
                Campanhas Concluídas
              </p>
              <h3 className="mt-2 text-3xl font-bold text-dark dark:text-white">
                {totalConcluidas}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Campanhas */}
      <div className="rounded-xl bg-white shadow-card dark:bg-gray-dark">
        <div className="border-b border-stroke p-6 dark:border-dark-3">
          <h3 className="text-xl font-bold text-dark dark:text-white">
            Todas as Campanhas
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {campanhas.map((campanha) => {
              const CanalIcon = canalIcons[campanha.canal];
              return (
                <div
                  key={campanha.id}
                  className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition-all hover:border-primary dark:border-dark-3 dark:hover:border-primary"
                >
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${
                      canalColors[campanha.canal]
                    }`}
                  >
                    <CanalIcon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-dark dark:text-white">
                      {campanha.nome}
                    </h4>
                    <div className="mt-1 flex items-center gap-4 text-sm text-dark-5 dark:text-dark-6">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campanha.publico}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(campanha.dataEnvio).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {campanha.totalEnvios}
                    </p>
                    <p className="text-xs text-dark-5 dark:text-dark-6">envios</p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                      statusColors[campanha.status]
                    }`}
                  >
                    {statusLabels[campanha.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
