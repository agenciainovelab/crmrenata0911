"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Modal from "@/components/Modal";

type RoleType = "SUPER_ADMIN" | "ADMIN" | "LIDER" | "PESSOA";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: RoleType;
  cadastradosTotal: number;
  dataCadastro: string;
}

interface FormData {
  nome: string;
  email: string;
  senha: string;
  role: RoleType;
}

const roleLabels: Record<RoleType, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  LIDER: "Líder",
  PESSOA: "Pessoa",
};

const roleColors: Record<RoleType, string> = {
  SUPER_ADMIN: "bg-purple-600 text-white",
  ADMIN: "bg-blue-600 text-white",
  LIDER: "bg-green-600 text-white",
  PESSOA: "bg-gray-600 text-white",
};

export default function UsuariosPage() {
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroRole, setFiltroRole] = useState<RoleType | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    role: "PESSOA",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Carregar usuários
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/usuarios");
      if (response.ok) {
        const data = await response.json();
        // Garantir que data é um array
        setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
      } else {
        console.error("Erro ao carregar usuários");
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Filtrar usuários (com verificação de segurança)
  const usuariosFiltrados = Array.isArray(usuarios)
    ? usuarios.filter((user) => {
        const matchRole = filtroRole === "todos" || user.role === filtroRole;
        const matchBusca =
          user.nome.toLowerCase().includes(busca.toLowerCase()) ||
          user.email.toLowerCase().includes(busca.toLowerCase());
        return matchRole && matchBusca;
      })
    : [];

  // Abrir modal para criar
  const handleNovo = () => {
    setEditingId(null);
    setFormData({
      nome: "",
      email: "",
      senha: "",
      role: "PESSOA",
    });
    setErrors({});
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditar = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      role: usuario.role,
    });
    setErrors({});
    setShowModal(true);
  };

  // Validar formulário
  const validarForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter no mínimo 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!editingId && !formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar (criar ou atualizar)
  const handleSalvar = async () => {
    if (!validarForm()) return;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/usuarios/${editingId}` : "/api/usuarios";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await carregarUsuarios();
        setShowModal(false);
        setFormData({ nome: "", email: "", senha: "", role: "PESSOA" });
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao salvar usuário");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir usuário
  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await carregarUsuarios();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao excluir usuário");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir usuário");
    }
  };

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
            Carregando usuários...
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
            Gerencie todos os usuários do sistema ({usuarios.length} total)
          </p>
        </div>
        <button
          onClick={handleNovo}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </button>
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

          {/* Filtro por role */}
          <select
            value={filtroRole}
            onChange={(e) => setFiltroRole(e.target.value as RoleType | "todos")}
            className="rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="todos">Todos os tipos</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="ADMIN">Admins</option>
            <option value="LIDER">Líderes</option>
            <option value="PESSOA">Pessoas</option>
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
                  Cadastrados
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-dark-5">
                    {busca || filtroRole !== "todos"
                      ? "Nenhum usuário encontrado com os filtros aplicados"
                      : "Nenhum usuário cadastrado"}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-stroke transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-dark dark:text-white">
                      {user.nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-5 dark:text-dark-6">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          roleColors[user.role]
                        }`}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {user.cadastradosTotal}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(user)}
                          className="rounded-lg bg-blue-500/10 p-2 text-blue-500 transition hover:bg-blue-500/20"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(user.id, user.nome)}
                          className="rounded-lg bg-red/10 p-2 text-red transition hover:bg-red/20"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Editar Usuário" : "Novo Usuário"}
        maxWidth="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSalvar(); }}>
          {/* Formulário */}
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.nome ? "border-red" : "border-stroke"
                  } bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && <p className="mt-1 text-xs text-red">{errors.nome}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.email ? "border-red" : "border-stroke"
                  } bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red">{errors.email}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Senha {!editingId && "*"}
                  {editingId && (
                    <span className="ml-2 text-xs font-normal text-dark-5">
                      (deixe em branco para manter a atual)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className={`w-full rounded-lg border ${
                      errors.senha ? "border-red" : "border-stroke"
                    } bg-transparent px-4 py-3 pr-12 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                    placeholder="Digite a senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-5 hover:text-dark"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.senha && <p className="mt-1 text-xs text-red">{errors.senha}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Tipo de Usuário *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                >
                  <option value="PESSOA">Pessoa</option>
                  <option value="LIDER">Líder</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

          {/* Botões */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-lg border border-stroke px-6 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
