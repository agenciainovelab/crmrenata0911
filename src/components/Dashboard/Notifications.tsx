"use client";

import { Bell, UserPlus } from "lucide-react";

interface Atividade {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  por: string;
  tempo: string;
}

interface NotificationsProps {
  atividades?: Atividade[];
}

export default function Notifications({ atividades }: NotificationsProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-political-blue/10 text-political-blue",
    green: "bg-green/10 text-green",
    purple: "bg-primary/10 text-primary",
  };

  const hasAtividades = atividades && atividades.length > 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark dark:text-white">
          Últimas Atividades
        </h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-political-blue/10">
          <Bell className="h-4 w-4 text-political-blue" />
        </div>
      </div>

      <div className="space-y-4">
        {hasAtividades ? (
          atividades.map((atividade) => (
            <div
              key={atividade.id}
              className="flex gap-4 rounded-lg border border-stroke p-4 transition-all hover:border-primary dark:border-dark-3 dark:hover:border-primary"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colorClasses.blue}`}
              >
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-dark dark:text-white">
                  {atividade.titulo}
                </h4>
                <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                  {atividade.descricao}
                </p>
                <p className="mt-2 text-xs text-dark-6 dark:text-dark-5">
                  {atividade.tempo} • por {atividade.por}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-dark-5 dark:text-dark-6">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma atividade recente</p>
            <p className="text-sm mt-1">Cadastre eleitores para ver as atividades aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
