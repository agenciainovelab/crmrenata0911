"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Camera, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PerfilData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: string;
  foto?: string | null;
  cadastradosTotal: number;
  dataCadastro: string;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  LIDER: "Líder",
  PESSOA: "Pessoa",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-600 text-white",
  ADMIN: "bg-blue-600 text-white",
  LIDER: "bg-green-600 text-white",
  PESSOA: "bg-gray-600 text-white",
};

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senhaAtual: "",
    senhaNova: "",
    senhaConfirma: "",
  });
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fotoError, setFotoError] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);

      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/auth/sign-in");
        return;
      }

      // Fetch user profile from API
      const response = await fetch(`/api/usuarios/${userId}`);
      if (!response.ok) throw new Error("Erro ao buscar perfil");

      const usuario = await response.json();

      const perfilData: PerfilData = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || "",
        role: usuario.role,
        foto: usuario.foto || null,
        cadastradosTotal: usuario.cadastradosTotal || usuario._count?.eleitores || 0,
        dataCadastro: usuario.dataCadastro || usuario.createdAt,
      };

      setPerfil(perfilData);
      setFotoError(false);
      setFormData({
        nome: perfilData.nome,
        email: perfilData.email,
        telefone: perfilData.telefone || "",
        senhaAtual: "",
        senhaNova: "",
        senhaConfirma: "",
      });
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      alert("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem");
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }

      setFotoFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validarForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.senhaNova) {
      if (!formData.senhaAtual) {
        newErrors.senhaAtual = "Digite a senha atual para alterá-la";
      }

      if (formData.senhaNova.length < 6) {
        newErrors.senhaNova = "A senha deve ter no mínimo 6 caracteres";
      }

      if (formData.senhaNova !== formData.senhaConfirma) {
        newErrors.senhaConfirma = "As senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarForm()) return;
    if (!perfil) return;

    setSubmitting(true);
    try {
      // 1. Upload photo if changed
      if (fotoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("foto", fotoFile);
        formDataUpload.append("userId", perfil.id);

        const uploadResponse = await fetch("/api/upload/foto", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Erro ao fazer upload da foto");
        }
      }

      // 2. Update profile data
      const updateData: any = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || undefined,
      };

      // Add password if changing
      if (formData.senhaNova) {
        updateData.senhaAtual = formData.senhaAtual;
        updateData.senhaNova = formData.senhaNova;
      }

      const updateResponse = await fetch(`/api/usuarios/${perfil.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Erro ao atualizar perfil");
      }

      alert("Perfil atualizado com sucesso!");
      setEditing(false);
      setPreviewFoto(null);
      setFotoFile(null);
      await carregarPerfil();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(error.message || "Erro ao salvar perfil");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-dark-5">Erro ao carregar perfil</p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">Meu Perfil</h1>
            <p className="mt-2 text-dark-5 dark:text-dark-6">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
          >
            Editar Perfil
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setErrors({});
                setPreviewFoto(null);
                setFotoFile(null);
                carregarPerfil();
              }}
              className="rounded-lg border border-stroke px-6 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
              disabled={submitting}
            >
              <Save className="h-5 w-5" />
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Foto e Info Básica */}
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark lg:col-span-1">
          <div className="flex flex-col items-center">
            {/* Foto */}
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-stroke dark:border-dark-3">
                {previewFoto ? (
                  <Image
                    src={previewFoto}
                    alt={perfil.nome}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : perfil.foto && !fotoError ? (
                  <Image
                    src={perfil.foto}
                    alt={perfil.nome}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    onError={() => setFotoError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/50">
                    <span className="text-3xl font-bold text-primary">
                      {perfil.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white shadow-lg transition hover:bg-opacity-90">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Nome e Role */}
            <h2 className="mt-4 text-xl font-bold text-dark dark:text-white">
              {perfil.nome}
            </h2>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                roleColors[perfil.role]
              }`}
            >
              {roleLabels[perfil.role]}
            </span>

            {/* Stats */}
            <div className="mt-6 w-full space-y-3 border-t border-stroke pt-6 dark:border-dark-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-5 dark:text-dark-6">Eleitores Cadastrados</span>
                <span className="font-semibold text-primary">{perfil.cadastradosTotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-5 dark:text-dark-6">Membro desde</span>
                <span className="font-semibold text-dark dark:text-white">
                  {perfil.dataCadastro && !isNaN(new Date(perfil.dataCadastro).getTime())
                    ? new Date(perfil.dataCadastro).toLocaleDateString("pt-BR")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Edição */}
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark lg:col-span-2">
          <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">
            Informações Pessoais
          </h3>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  disabled={!editing}
                  className={`w-full rounded-lg border ${
                    errors.nome ? "border-red" : "border-stroke"
                  } bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3`}
                  placeholder="Digite seu nome completo"
                />
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-5" />
              </div>
              {errors.nome && <p className="mt-1 text-xs text-red">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className={`w-full rounded-lg border ${
                    errors.email ? "border-red" : "border-stroke"
                  } bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3`}
                  placeholder="email@exemplo.com"
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-5" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Telefone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={!editing}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-dark outline-none transition focus:border-primary disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:disabled:bg-dark-3"
                  placeholder="(00) 00000-0000"
                />
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-5" />
              </div>
            </div>

            {/* Tipo de Usuário (somente visualização) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Tipo de Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roleLabels[perfil.role]}
                  disabled
                  className="w-full rounded-lg border border-stroke bg-gray-2 py-3 pl-12 pr-4 text-dark outline-none dark:border-dark-3 dark:bg-dark-3 dark:text-white"
                />
                <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-5" />
              </div>
            </div>

            {/* Alterar Senha (apenas se estiver editando) */}
            {editing && (
              <>
                <div className="my-6 border-t border-stroke dark:border-dark-3"></div>
                <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                  Alterar Senha
                </h3>

                {/* Senha Atual */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={formData.senhaAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, senhaAtual: e.target.value })
                    }
                    className={`w-full rounded-lg border ${
                      errors.senhaAtual ? "border-red" : "border-stroke"
                    } bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                    placeholder="Digite sua senha atual"
                  />
                  {errors.senhaAtual && (
                    <p className="mt-1 text-xs text-red">{errors.senhaAtual}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.senhaNova}
                    onChange={(e) => setFormData({ ...formData, senhaNova: e.target.value })}
                    className={`w-full rounded-lg border ${
                      errors.senhaNova ? "border-red" : "border-stroke"
                    } bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                    placeholder="Digite a nova senha"
                  />
                  {errors.senhaNova && (
                    <p className="mt-1 text-xs text-red">{errors.senhaNova}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.senhaConfirma}
                    onChange={(e) =>
                      setFormData({ ...formData, senhaConfirma: e.target.value })
                    }
                    className={`w-full rounded-lg border ${
                      errors.senhaConfirma ? "border-red" : "border-stroke"
                    } bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white`}
                    placeholder="Confirme a nova senha"
                  />
                  {errors.senhaConfirma && (
                    <p className="mt-1 text-xs text-red">{errors.senhaConfirma}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
