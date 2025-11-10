"use client";

import { useState, useEffect } from "react";
import { Bell, Users, MessageSquare, TrendingUp } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    icon: Users,
    title: "Novos cadastros",
    message: "15 novos líderes cadastrados hoje",
    time: "5 min atrás",
    color: "blue",
  },
  {
    id: 2,
    icon: MessageSquare,
    title: "Campanha enviada",
    message: "WhatsApp enviado para 1.250 pessoas",
    time: "1 hora atrás",
    color: "green",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Meta atingida",
    message: "Objetivo de 1.000 cadastros alcançado!",
    time: "3 horas atrás",
    color: "purple",
  },
];

export default function Notifications() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-3 dark:bg-dark-3"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
                <div className="h-3 w-full animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const colorClasses: Record<string, string> = {
    blue: "bg-political-blue/10 text-political-blue",
    green: "bg-green/10 text-green",
    purple: "bg-primary/10 text-primary",
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark dark:text-white">
          Notificações
        </h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-political-blue/10">
          <Bell className="h-4 w-4 text-political-blue" />
        </div>
      </div>

      <div className="space-y-4">
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className="flex gap-4 rounded-lg border border-stroke p-4 transition-all hover:border-primary dark:border-dark-3 dark:hover:border-primary"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                  colorClasses[notification.color]
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-dark dark:text-white">
                  {notification.title}
                </h4>
                <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-dark-6 dark:text-dark-5">
                  {notification.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
