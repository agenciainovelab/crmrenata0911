"use client";

import { useState, useEffect } from "react";
import { Download, BarChart3, PieChart, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const cadastrosPorMes = [
  { mes: "Jan", cadastros: 45 },
  { mes: "Fev", cadastros: 68 },
  { mes: "Mar", cadastros: 95 },
  { mes: "Abr", cadastros: 127 },
  { mes: "Mai", cadastros: 158 },
  { mes: "Jun", cadastros: 203 },
];

const distribuicaoPorTipo = [
  { tipo: "Super Admins", valor: 8, cor: "#3A0CA3" },
  { tipo: "Admins", valor: 35, cor: "#7B2CBF" },
  { tipo: "Líderes", valor: 128, cor: "#9D4EDD" },
  { tipo: "Pessoas", valor: 890, cor: "#3B82F6" },
];

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    alert("Exportação de CSV será implementada com dados reais");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl bg-gray-3 dark:bg-dark-3"></div>
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-primary">
          Carregando relatórios {progress}%
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Relatórios</h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Análises e visualizações de dados da campanha
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          <Download className="h-5 w-5" />
          Exportar CSV
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { label: "Total de Usuários", value: "1.061", icon: TrendingUp, color: "purple" },
          { label: "Cadastros este Mês", value: "203", icon: BarChart3, color: "blue" },
          { label: "Taxa de Crescimento", value: "+28%", icon: TrendingUp, color: "green" },
          { label: "Campanhas Ativas", value: "12", icon: PieChart, color: "purple" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
                    {stat.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-dark dark:text-white">
                    {stat.value}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Gráfico de Barras */}
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
            Cadastros por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cadastrosPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="cadastros" fill="#7B2CBF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza */}
        <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
          <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
            Distribuição por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={distribuicaoPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ tipo, valor }) => `${tipo}: ${valor}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {distribuicaoPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="rounded-xl bg-white shadow-card dark:bg-gray-dark">
        <div className="border-b border-stroke p-6 dark:border-dark-3">
          <h3 className="text-xl font-bold text-dark dark:text-white">
            Resumo Detalhado
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Este Mês
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-white">
                  Crescimento
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { categoria: "Super Admins", total: 8, mes: 2, crescimento: "+33%" },
                { categoria: "Admins", total: 35, mes: 7, crescimento: "+25%" },
                { categoria: "Líderes", total: 128, mes: 23, crescimento: "+22%" },
                { categoria: "Pessoas", total: 890, mes: 170, crescimento: "+24%" },
              ].map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-stroke transition hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                >
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">
                    {row.categoria}
                  </td>
                  <td className="px-6 py-4 text-dark-5 dark:text-dark-6">{row.total}</td>
                  <td className="px-6 py-4 text-dark-5 dark:text-dark-6">{row.mes}</td>
                  <td className="px-6 py-4 font-semibold text-green">{row.crescimento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
