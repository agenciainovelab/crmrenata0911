"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Palette, Plug, Save } from "lucide-react";

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("permissoes");
  const [saving, setSaving] = useState(false);

  // Estados de configuração
  const [permissions, setPermissions] = useState({
    superAdminCanDelete: true,
    adminCanCreateCampaigns: true,
    liderCanViewReports: false,
    pessoaCanInvite: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Configurações salvas com sucesso!");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-3 dark:bg-dark-3"></div>
        <div className="mt-6 text-center text-sm text-primary">
          Carregando configurações {progress}%
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "permissoes", label: "Permissões e Roles", icon: Shield },
    { id: "tema", label: "Tema", icon: Palette },
    { id: "integracoes", label: "Integrações", icon: Plug },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white">Configurações</h1>
        <p className="mt-2 text-dark-5 dark:text-dark-6">
          Gerencie permissões, tema e integrações do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="rounded-xl bg-white shadow-card dark:bg-gray-dark">
        <div className="border-b border-stroke dark:border-dark-3">
          <div className="flex gap-2 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-dark-5 hover:bg-gray-1 dark:text-dark-6 dark:hover:bg-dark-2"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Tab: Permissões */}
          {activeTab === "permissoes" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-bold text-dark dark:text-white">
                  Permissões por Tipo de Usuário
                </h3>
                <p className="text-sm text-dark-5 dark:text-dark-6">
                  Defina o que cada tipo de usuário pode fazer no sistema
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <div>
                    <h4 className="font-semibold text-dark dark:text-white">
                      Super Admin pode deletar usuários
                    </h4>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      Permite que Super Admins excluam qualquer usuário do sistema
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={permissions.superAdminCanDelete}
                      onChange={(e) =>
                        setPermissions({ ...permissions, superAdminCanDelete: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-3 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-dark-3"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <div>
                    <h4 className="font-semibold text-dark dark:text-white">
                      Admin pode criar campanhas
                    </h4>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      Permite que Admins criem e gerenciem campanhas políticas
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={permissions.adminCanCreateCampaigns}
                      onChange={(e) =>
                        setPermissions({
                          ...permissions,
                          adminCanCreateCampaigns: e.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-3 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-dark-3"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <div>
                    <h4 className="font-semibold text-dark dark:text-white">
                      Líder pode visualizar relatórios
                    </h4>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      Permite que Líderes acessem a página de relatórios e análises
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={permissions.liderCanViewReports}
                      onChange={(e) =>
                        setPermissions({ ...permissions, liderCanViewReports: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-3 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-dark-3"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <div>
                    <h4 className="font-semibold text-dark dark:text-white">
                      Pessoa pode convidar outros
                    </h4>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      Permite que usuários do tipo Pessoa convidem novos cadastros
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={permissions.pessoaCanInvite}
                      onChange={(e) =>
                        setPermissions({ ...permissions, pessoaCanInvite: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-3 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-dark-3"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Tema */}
          {activeTab === "tema" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-bold text-dark dark:text-white">
                  Personalização de Tema
                </h3>
                <p className="text-sm text-dark-5 dark:text-dark-6">
                  Ajuste as cores e aparência do sistema
                </p>
              </div>

              <div className="rounded-lg border border-stroke p-6 dark:border-dark-3">
                <h4 className="mb-4 font-semibold text-dark dark:text-white">
                  Paleta de Cores Atual
                </h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <div className="mb-2 h-20 rounded-lg bg-primary"></div>
                    <p className="text-sm text-dark dark:text-white">Roxo Principal</p>
                    <p className="text-xs text-dark-5">#7B2CBF</p>
                  </div>
                  <div>
                    <div className="mb-2 h-20 rounded-lg bg-primary-dark"></div>
                    <p className="text-sm text-dark dark:text-white">Roxo Escuro</p>
                    <p className="text-xs text-dark-5">#3A0CA3</p>
                  </div>
                  <div>
                    <div className="mb-2 h-20 rounded-lg bg-political-blue"></div>
                    <p className="text-sm text-dark dark:text-white">Azul Político</p>
                    <p className="text-xs text-dark-5">#3B82F6</p>
                  </div>
                  <div>
                    <div className="mb-2 h-20 rounded-lg bg-gray-1"></div>
                    <p className="text-sm text-dark dark:text-white">Fundo Claro</p>
                    <p className="text-xs text-dark-5">#F9FAFB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Integrações */}
          {activeTab === "integracoes" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-bold text-dark dark:text-white">
                  Integrações Disponíveis
                </h3>
                <p className="text-sm text-dark-5 dark:text-dark-6">
                  Conecte serviços externos ao sistema
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { nome: "WhatsApp Business API", status: "Não configurado" },
                  { nome: "SendGrid (Email)", status: "Não configurado" },
                  { nome: "Twilio (SMS/Voz)", status: "Não configurado" },
                  { nome: "Google Analytics", status: "Não configurado" },
                ].map((integracao, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-stroke p-4 dark:border-dark-3"
                  >
                    <div>
                      <h4 className="font-semibold text-dark dark:text-white">
                        {integracao.nome}
                      </h4>
                      <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                        Status: {integracao.status}
                      </p>
                    </div>
                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90">
                      Configurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
}
