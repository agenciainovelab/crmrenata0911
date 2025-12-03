"use client";

import { useState } from "react";
import { Users, Network, List } from "lucide-react";
import GruposTab from "@/components/Configuracoes/GruposTab";
import SubgruposTab from "@/components/Configuracoes/SubgruposTab";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("grupos");

  const tabs = [
    { id: "grupos", label: "Grupos", icon: Users },
    { id: "subgrupos", label: "Subgrupos", icon: Network },
    { id: "campos", label: "Campos de Formulário", icon: List },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white">Configurações</h1>
        <p className="mt-2 text-dark-5 dark:text-dark-6">
          Gerencie grupos, subgrupos e campos de formulário
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
          {activeTab === "grupos" && <GruposTab />}
          {activeTab === "subgrupos" && <SubgruposTab />}
          {activeTab === "campos" && (
            <div className="text-center py-12">
              <p className="text-dark-5 dark:text-dark-6 text-lg mb-2">
                Configuração de Campos de Formulário
              </p>
              <p className="text-sm text-dark-5 dark:text-dark-6">
                Em desenvolvimento...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
