"use client";

import { useState, useEffect } from "react";
import { UserCog, UserCheck, Users, User, Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

type UserType = "super-admin" | "admin" | "lider" | "pessoa";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: UserType;
  cadastradoPor: string;
  cadastradosTotal: number;
  dataCadastro: string;
}

const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@email.com",
    tipo: "super-admin",
    cadastradoPor: "Sistema",
    cadastradosTotal: 45,
    dataCadastro: "2024-01-15",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria@email.com",
    tipo: "admin",
    cadastradoPor: "João Silva",
    cadastradosTotal: 28,
    dataCadastro: "2024-02-20",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    email: "pedro@email.com",
    tipo: "lider",
    cadastradoPor: "Maria Santos",
    cadastradosTotal: 15,
    dataCadastro: "2024-03-10",
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    email: "ana@email.com",
    tipo: "pessoa",
    cadastradoPor: "Pedro Costa",
    cadastradosTotal: 0,
    dataCadastro: "2024-04-05",
  },
];

const tipoLabels: Record<UserType, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  lider: "Líder",
  pessoa: "Pessoa",
};

const tipoColors: Record<UserType, string> = {
  "super-admin": "bg-primary-dark text-white",
  admin: "bg-primary text-white",
  lider: "bg-primary-light text-white",
  pessoa: "bg-gray-5 text-white",
};

export default function UsuariosPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<UserType | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            setUsuarios(mockUsuarios);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const usuariosFiltrados = usuarios.filter((user) => {
    const matchTipo = filtroTipo === "todos" || user.tipo === filtroTipo;
    const matchBusca =
      user.nome.toLowerCase().includes(busca.toLowerCase()) ||
      user.email.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <div className="mb-6 h-10 w-full animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-primary">
            Carregando usuários {progress}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Usuários</h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Link
          href="/dashboard/usuarios/novo"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-5" />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as UserType | "todos")}
            className="rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="todos">Todos os tipos</option>
            <option value="super-admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="lider">Líderes</option>
            <option value="pessoa">Pessoas</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white shadow-card dark:bg-gray-dark">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Cadastrado Por
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Cadastrados
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-stroke transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                >
                  <td className="px-6 py-4 text-sm text-dark dark:text-white">
                    {user.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-5 dark:text-dark-6">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        tipoColors[user.tipo]
                      }`}
                    >
                      {tipoLabels[user.tipo]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-5 dark:text-dark-6">
                    {user.cadastradoPor}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {user.cadastradosTotal}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-political-blue/10 p-2 text-political-blue transition hover:bg-political-blue/20">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg bg-red/10 p-2 text-red transition hover:bg-red/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
