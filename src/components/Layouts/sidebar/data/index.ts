import * as Icons from "../icons";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Megaphone,
  MessageSquare,
  Brain,
  BarChart3,
  Settings,
  Calendar
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "MENU PRINCIPAL",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        items: [],
      },
      {
        title: "Usuários",
        url: "/dashboard/usuarios",
        icon: Users,
        items: [],
      },
      {
        title: "Hierarquia",
        url: "/dashboard/hierarquia",
        icon: GitBranch,
        items: [],
      },
      {
        title: "Eleitores",
        url: "/dashboard/eleitores",
        icon: Users,
        items: [],
      },
      {
        title: "Reuniões",
        url: "/dashboard/reunioes",
        icon: Calendar,
        items: [],
      },
      {
        title: "Campanhas",
        url: "/dashboard/campanhas",
        icon: Megaphone,
        items: [],
      },
      {
        title: "Comunicação",
        url: "/dashboard/comunicacao",
        icon: MessageSquare,
        items: [],
      },
    ],
  },
  {
    label: "ANÁLISES",
    items: [
      {
        title: "IA e Análises",
        url: "/dashboard/ia",
        icon: Brain,
        items: [],
      },
      {
        title: "Relatórios",
        url: "/dashboard/relatorios",
        icon: BarChart3,
        items: [],
      },
      {
        title: "Configurações",
        url: "/dashboard/configuracoes",
        icon: Settings,
        items: [],
      },
    ],
  },
];
