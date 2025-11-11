"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Notificacao {
  id: string;
  imagem: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  data: string;
}

const notificacoesMock: Notificacao[] = [
  {
    id: "1",
    imagem: "/images/user/user-15.png",
    titulo: "Novo eleitor cadastrado",
    descricao: "João Silva foi cadastrado no sistema",
    lida: false,
    data: "2025-11-10T10:30:00",
  },
  {
    id: "2",
    imagem: "/images/user/user-03.png",
    titulo: "Reunião agendada",
    descricao: "Reunião marcada para amanhã às 14h",
    lida: false,
    data: "2025-11-10T09:15:00",
  },
  {
    id: "3",
    imagem: "/images/user/user-26.png",
    titulo: "Meta alcançada",
    descricao: "500 eleitores cadastrados este mês",
    lida: false,
    data: "2025-11-10T08:00:00",
  },
  {
    id: "4",
    imagem: "/images/user/user-28.png",
    titulo: "Atualização do sistema",
    descricao: "Novas funcionalidades disponíveis",
    lida: true,
    data: "2025-11-09T16:45:00",
  },
  {
    id: "5",
    imagem: "/images/user/user-27.png",
    titulo: "Novo líder cadastrado",
    descricao: "Maria Santos agora é líder do grupo Norte",
    lida: true,
    data: "2025-11-09T14:20:00",
  },
];

export default function NotificacoesPage() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notificacoesMock);
  const [filtro, setFiltro] = useState<"todas" | "nao-lidas">("todas");

  const notificacoesFiltradas = notificacoes.filter((notif) => {
    if (filtro === "nao-lidas") {
      return !notif.lida;
    }
    return true;
  });

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  const marcarComoLida = (id: string) => {
    setNotificacoes(
      notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(notificacoes.map((n) => ({ ...n, lida: true })));
  };

  const excluirNotificacao = (id: string) => {
    setNotificacoes(notificacoes.filter((n) => n.id !== id));
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
    if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
    if (diffDias < 7) return `Há ${diffDias} dia${diffDias > 1 ? "s" : ""}`;

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-dark-5 transition hover:bg-gray-2 dark:text-dark-6 dark:hover:bg-dark-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark dark:text-white">
              Notificações
            </h1>
            <p className="mt-2 text-dark-5 dark:text-dark-6">
              {naoLidasCount > 0
                ? `Você tem ${naoLidasCount} notificação${naoLidasCount > 1 ? "ões" : ""} não lida${naoLidasCount > 1 ? "s" : ""}`
                : "Todas as notificações foram lidas"}
            </p>
          </div>
        </div>
        {naoLidasCount > 0 && (
          <button
            onClick={marcarTodasComoLidas}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
          >
            <CheckCheck className="h-5 w-5" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="rounded-xl bg-white p-4 shadow-card dark:bg-gray-dark">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro("todas")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filtro === "todas"
                ? "bg-primary text-white"
                : "bg-gray-2 text-dark hover:bg-gray-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            }`}
          >
            Todas ({notificacoes.length})
          </button>
          <button
            onClick={() => setFiltro("nao-lidas")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filtro === "nao-lidas"
                ? "bg-primary text-white"
                : "bg-gray-2 text-dark hover:bg-gray-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
            }`}
          >
            Não lidas ({naoLidasCount})
          </button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notificacoesFiltradas.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-card dark:bg-gray-dark">
            <Bell className="mx-auto mb-4 h-16 w-16 text-dark-5 dark:text-dark-6" />
            <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
              Nenhuma notificação
            </h3>
            <p className="text-dark-5 dark:text-dark-6">
              {filtro === "nao-lidas"
                ? "Você não tem notificações não lidas"
                : "Você não tem notificações"}
            </p>
          </div>
        ) : (
          notificacoesFiltradas.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 shadow-card transition hover:shadow-lg ${
                notif.lida
                  ? "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"
                  : "border-primary/30 bg-blue-50 dark:border-primary/30 dark:bg-dark-2"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Imagem */}
                <div className="flex-shrink-0">
                  <Image
                    src={notif.imagem}
                    alt={notif.titulo}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-dark dark:text-white">
                      {notif.titulo}
                      {!notif.lida && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </h3>
                    <span className="flex-shrink-0 text-xs text-dark-5 dark:text-dark-6">
                      {formatarData(notif.data)}
                    </span>
                  </div>
                  <p className="text-sm text-dark-5 dark:text-dark-6">
                    {notif.descricao}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex flex-shrink-0 gap-2">
                  {!notif.lida && (
                    <button
                      onClick={() => marcarComoLida(notif.id)}
                      className="rounded-lg bg-primary/10 p-2 text-primary transition hover:bg-primary/20"
                      title="Marcar como lida"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => excluirNotificacao(notif.id)}
                    className="rounded-lg bg-red/10 p-2 text-red transition hover:bg-red/20"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
