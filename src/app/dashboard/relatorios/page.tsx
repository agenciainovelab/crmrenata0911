"use client";

import { useState, useEffect } from "react";
import {
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Flame,
  FileSpreadsheet,
  Filter,
  Loader2,
  RefreshCw,
  MapPin,
  Building,
} from "lucide-react";
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

interface RelatorioData {
  totalEleitores: number;
  eleitoresAquecidos: number;
  eleitoresExportados: number;
  eleitoresNaoAquecidos: number;
  eleitoresNaoExportados: number;
  taxaAquecimento: string;
  taxaExportacao: string;
  crescimento: string;
  usuarios: {
    SUPER_ADMIN: number;
    ADMIN: number;
    LIDER: number;
    PESSOA: number;
  };
  totalUsuarios: number;
  cadastrosPorMes: Array<{ mes: string; cadastros: number }>;
  eleitoresPorCidade: Array<{ cidade: string; total: number }>;
  eleitoresPorBairro: Array<{ bairro: string; total: number }>;
  eleitoresPorGrupo: Array<{ grupo: string; grupoId: string; total: number }>;
  distribuicaoPorTipo: Array<{ tipo: string; valor: number; cor: string }>;
  statusAquecimento: Array<{ status: string; valor: number; cor: string }>;
  statusExportacao: Array<{ status: string; valor: number; cor: string }>;
}

interface Grupo {
  id: string;
  nome: string;
}

interface Subgrupo {
  id: string;
  nome: string;
  grupoId: string;
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<RelatorioData | null>(null);

  // Filtros
  const [periodo, setPeriodo] = useState("6m");
  const [grupoId, setGrupoId] = useState("");
  const [subgrupoId, setSubgrupoId] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Listas para filtros
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);

  // Carregar grupos e subgrupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await fetch("/api/grupos");
        if (response.ok) {
          const data = await response.json();
          setGrupos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      }
    };

    const fetchSubgrupos = async () => {
      try {
        const response = await fetch("/api/subgrupos");
        if (response.ok) {
          const data = await response.json();
          setSubgrupos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar subgrupos:", error);
      }
    };

    fetchGrupos();
    fetchSubgrupos();
  }, []);

  // Subgrupos filtrados
  const subgruposFiltrados = grupoId
    ? subgrupos.filter((s) => s.grupoId === grupoId)
    : subgrupos;

  // Carregar dados do relatorio
  useEffect(() => {
    fetchRelatorio();
  }, [periodo, grupoId, subgrupoId, cidade, bairro]);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      let url = `/api/relatorios?periodo=${periodo}`;
      if (grupoId) url += `&grupoId=${grupoId}`;
      if (subgrupoId) url += `&subgrupoId=${subgrupoId}`;
      if (cidade) url += `&cidade=${encodeURIComponent(cidade)}`;
      if (bairro) url += `&bairro=${encodeURIComponent(bairro)}`;

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Erro ao carregar relatorios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (tipo: string) => {
    setExporting(true);
    try {
      const response = await fetch("/api/relatorios/exportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          periodo,
          grupoId,
          subgrupoId,
          cidade,
          bairro,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Criar e baixar arquivo
        const blob = new Blob(["\ufeff" + result.csv], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = result.nomeArquivo;
        link.click();

        alert(`Exportados ${result.total} registros com sucesso!`);
      } else {
        alert("Erro ao exportar relatorio");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar relatorio");
    } finally {
      setExporting(false);
    }
  };

  const limparFiltros = () => {
    setPeriodo("6m");
    setGrupoId("");
    setSubgrupoId("");
    setCidade("");
    setBairro("");
  };

  const hasActiveFilters = grupoId || subgrupoId || cidade || bairro || periodo !== "6m";

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Relatorios
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Analises e visualizacoes de dados da campanha
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                !
              </span>
            )}
          </button>
          <button
            onClick={fetchRelatorio}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Periodo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periodo
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="1m">Ultimo mes</option>
                <option value="3m">Ultimos 3 meses</option>
                <option value="6m">Ultimos 6 meses</option>
                <option value="12m">Ultimo ano</option>
                <option value="all">Todo periodo</option>
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo
              </label>
              <select
                value={grupoId}
                onChange={(e) => {
                  setGrupoId(e.target.value);
                  setSubgrupoId("");
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os grupos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Subgrupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subgrupo
              </label>
              <select
                value={subgrupoId}
                onChange={(e) => setSubgrupoId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os subgrupos</option>
                {subgruposFiltrados.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Digite a cidade..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Digite o bairro..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={limparFiltros}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Eleitores
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {data?.totalEleitores?.toLocaleString("pt-BR") || "0"}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Eleitores Aquecidos
              </p>
              <h3 className="mt-2 text-2xl font-bold text-orange-600">
                {data?.eleitoresAquecidos?.toLocaleString("pt-BR") || "0"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {data?.taxaAquecimento || "0"}% do total
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <Flame className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Exportados
              </p>
              <h3 className="mt-2 text-2xl font-bold text-green-600">
                {data?.eleitoresExportados?.toLocaleString("pt-BR") || "0"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {data?.taxaExportacao || "0"}% do total
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Crescimento
              </p>
              <h3
                className={`mt-2 text-2xl font-bold ${
                  data?.crescimento?.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {data?.crescimento || "0%"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">vs. mes anterior</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Botoes de Exportacao */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Exportar Relatorios
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExportCSV("eleitores")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Todos os Eleitores
          </button>
          <button
            onClick={() => handleExportCSV("aquecidos")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            <Flame className="h-4 w-4" />
            Apenas Aquecidos
          </button>
          <button
            onClick={() => handleExportCSV("nao_aquecidos")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            Nao Aquecidos
          </button>
          <button
            onClick={() => handleExportCSV("exportados")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Ja Exportados
          </button>
          <button
            onClick={() => handleExportCSV("nao_exportados")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Nao Exportados
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Os filtros aplicados acima serao considerados na exportacao.
        </p>
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Grafico de Barras - Cadastros por Mes */}
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
            Cadastros por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.cadastrosPorMes || []}>
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

        {/* Grafico de Pizza - Status de Aquecimento */}
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
            Status de Aquecimento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={data?.statusAquecimento || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.status}: ${props.valor}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {(data?.statusAquecimento || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Grafico de Barras - Eleitores por Cidade */}
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top 10 Cidades
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data?.eleitoresPorCidade || []}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis
                dataKey="cidade"
                type="category"
                stroke="#6B7280"
                style={{ fontSize: "11px" }}
                width={75}
              />
              <Tooltip />
              <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grafico de Barras - Eleitores por Bairro */}
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top 10 Bairros
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data?.eleitoresPorBairro || []}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis
                dataKey="bairro"
                type="category"
                stroke="#6B7280"
                style={{ fontSize: "11px" }}
                width={75}
              />
              <Tooltip />
              <Bar dataKey="total" fill="#9D4EDD" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Resumo por Tipo */}
      <div className="rounded-xl bg-white shadow-md dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Resumo por Categoria
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Porcentagem
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Super Admins
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.usuarios?.SUPER_ADMIN || 0}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.totalUsuarios
                    ? (
                        ((data?.usuarios?.SUPER_ADMIN || 0) / data.totalUsuarios) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Admins
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.usuarios?.ADMIN || 0}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.totalUsuarios
                    ? (
                        ((data?.usuarios?.ADMIN || 0) / data.totalUsuarios) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Lideres
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.usuarios?.LIDER || 0}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {data?.totalUsuarios
                    ? (
                        ((data?.usuarios?.LIDER || 0) / data.totalUsuarios) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Eleitores Cadastrados
                </td>
                <td className="px-6 py-4 text-blue-600 font-semibold">
                  {data?.totalEleitores?.toLocaleString("pt-BR") || 0}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">-</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Eleitores Aquecidos
                </td>
                <td className="px-6 py-4 text-orange-600 font-semibold">
                  {data?.eleitoresAquecidos?.toLocaleString("pt-BR") || 0}
                </td>
                <td className="px-6 py-4 text-orange-600 font-semibold">
                  {data?.taxaAquecimento || "0"}%
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  Eleitores Exportados
                </td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  {data?.eleitoresExportados?.toLocaleString("pt-BR") || 0}
                </td>
                <td className="px-6 py-4 text-green-600 font-semibold">
                  {data?.taxaExportacao || "0"}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Eleitores por Grupo */}
      {data?.eleitoresPorGrupo && data.eleitoresPorGrupo.length > 0 && (
        <div className="rounded-xl bg-white shadow-md dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Eleitores por Grupo
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Grupo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Total de Eleitores
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Porcentagem
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.eleitoresPorGrupo.map((g, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {g.grupo}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {g.total.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {data.totalEleitores
                        ? ((g.total / data.totalEleitores) * 100).toFixed(1)
                        : "0"}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Relatorio gerado em {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
}
