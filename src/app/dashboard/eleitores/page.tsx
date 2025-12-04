'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  Download,
  CheckCircle,
  Filter,
  X,
  FileSpreadsheet,
  ChevronDown,
  ArrowUpDown,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Flame,
  Mail,
} from 'lucide-react';
import FormularioCadastroEleitor from '@/components/Eleitores/FormularioCadastro';
import FormularioEdicaoEleitor from '@/components/Eleitores/FormularioEdicao';
import ImportacaoEleitores from '@/components/Eleitores/ImportacaoEleitores';
import Modal from '@/components/Modal';

interface Eleitor {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email?: string;
  cidade: string;
  uf: string;
  bairro?: string;
  grupoId?: string;
  subgrupoId?: string;
  grupo?: { id: string; nome: string };
  subgrupo?: { id: string; nome: string };
  exportado?: boolean;
  exportadoEm?: string;
  aquecido?: boolean;
  aquecidoEm?: string;
  criadoPor: {
    nome: string;
    role: string;
  };
  createdAt: string;
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

type SortOrder = 'nome_asc' | 'nome_desc' | 'data_desc' | 'data_asc' | 'cidade_asc' | 'cidade_desc';

export default function EleitoresPage() {
  const [eleitores, setEleitores] = useState<Eleitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteManyModal, setShowDeleteManyModal] = useState(false);
  const [selectedEleitor, setSelectedEleitor] = useState<Eleitor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEleitores, setTotalEleitores] = useState(0);

  // Filtros
  const [filtroNovosCadastros, setFiltroNovosCadastros] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Novos filtros
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroSubgrupo, setFiltroSubgrupo] = useState('');
  const [filtroBairro, setFiltroBairro] = useState('');
  const [filtroAquecido, setFiltroAquecido] = useState<'todos' | 'aquecidos' | 'nao_aquecidos'>('todos');
  const [sortOrder, setSortOrder] = useState<SortOrder>('data_desc');
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Seleção múltipla
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Lista de bairros únicos
  const [bairrosUnicos, setBairrosUnicos] = useState<string[]>([]);

  // Modal de email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAssunto, setEmailAssunto] = useState('');
  const [emailConteudo, setEmailConteudo] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [aquecendo, setAquecendo] = useState(false);

  // Carregar grupos e subgrupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await fetch('/api/grupos');
        if (response.ok) {
          const data = await response.json();
          setGrupos(data);
        }
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      }
    };

    const fetchSubgrupos = async () => {
      try {
        const response = await fetch('/api/subgrupos');
        if (response.ok) {
          const data = await response.json();
          setSubgrupos(data);
        }
      } catch (error) {
        console.error('Erro ao carregar subgrupos:', error);
      }
    };

    fetchGrupos();
    fetchSubgrupos();
  }, []);

  // Subgrupos filtrados pelo grupo selecionado
  const subgruposFiltrados = useMemo(() => {
    if (!filtroGrupo) return subgrupos;
    return subgrupos.filter(s => s.grupoId === filtroGrupo);
  }, [subgrupos, filtroGrupo]);

  useEffect(() => {
    fetchEleitores();
    // Limpar seleção quando filtros mudam
    setSelectedIds(new Set());
  }, [currentPage, search, filtroNovosCadastros, filtroGrupo, filtroSubgrupo, filtroBairro, filtroAquecido, sortOrder, showAllRecords]);

  const fetchEleitores = async () => {
    setLoading(true);
    try {
      const limit = showAllRecords ? 1000 : 10;
      let url = `/api/eleitores?page=${currentPage}&limit=${limit}&search=${search}`;

      if (filtroNovosCadastros) {
        url += '&novosCadastros=true&naoExportados=true';
      }

      if (filtroGrupo) {
        url += `&grupoId=${filtroGrupo}`;
      }

      if (filtroSubgrupo) {
        url += `&subgrupoId=${filtroSubgrupo}`;
      }

      if (filtroBairro) {
        url += `&bairro=${encodeURIComponent(filtroBairro)}`;
      }

      // Filtro de aquecidos
      if (filtroAquecido === 'aquecidos') {
        url += '&aquecido=true';
      } else if (filtroAquecido === 'nao_aquecidos') {
        url += '&aquecido=false';
      }

      // Ordenação
      const [sortField, sortDir] = sortOrder.split('_');
      url += `&sortBy=${sortField}&sortDir=${sortDir}`;

      const response = await fetch(url);
      const data = await response.json();
      setEleitores(data.eleitores || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalEleitores(data.pagination?.total || 0);

      // Extrair bairros únicos
      if (data.eleitores) {
        const bairros = [...new Set(data.eleitores.map((e: Eleitor) => e.bairro).filter(Boolean))] as string[];
        setBairrosUnicos(prev => {
          const combined = [...new Set([...prev, ...bairros])];
          return combined.sort();
        });
      }
    } catch (error) {
      console.error('Erro ao carregar eleitores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eleitor: Eleitor) => {
    setSelectedEleitor(eleitor);
    setShowEditModal(true);
  };

  const handleDelete = (eleitor: Eleitor) => {
    setSelectedEleitor(eleitor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedEleitor) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/eleitores/${selectedEleitor.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedEleitor(null);
        fetchEleitores();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir eleitor');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir eleitor');
    } finally {
      setDeleting(false);
    }
  };

  // Exclusão em lote
  const confirmDeleteMany = async () => {
    if (selectedIds.size === 0) return;
    if (deleteConfirmText !== 'EXCLUIR') {
      alert('Digite EXCLUIR para confirmar');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/eleitores/excluir-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} eleitor(es) excluído(s) com sucesso`);
        setShowDeleteManyModal(false);
        setSelectedIds(new Set());
        setDeleteConfirmText('');
        fetchEleitores();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir eleitores');
      }
    } catch (error) {
      console.error('Erro ao excluir em lote:', error);
      alert('Erro ao excluir eleitores');
    } finally {
      setDeleting(false);
    }
  };

  // Seleção
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === eleitores.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eleitores.map(e => e.id)));
    }
  };

  const isAllSelected = eleitores.length > 0 && selectedIds.size === eleitores.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < eleitores.length;

  const handleExportar = async () => {
    if (eleitores.length === 0) return;

    setExporting(true);
    try {
      // Preparar dados para exportação respeitando filtros e ordenação atuais
      const idsParaExportar = eleitores
        .filter(e => !e.exportado)
        .map(e => e.id);

      if (idsParaExportar.length === 0) {
        alert('Todos os eleitores já foram exportados');
        return;
      }

      // Gerar CSV
      const csvData = eleitores
        .filter(e => !e.exportado)
        .map(e => ({
          Nome: e.nomeCompleto,
          CPF: e.cpf || '',
          Telefone: e.telefone || '',
          Cidade: e.cidade || '',
          UF: e.uf || '',
          Bairro: e.bairro || '',
          'Data Cadastro': new Date(e.createdAt).toLocaleDateString('pt-BR'),
        }));

      // Criar CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(';'),
        ...csvData.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(';'))
      ].join('\n');

      // Download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `eleitores_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      // Marcar como exportados
      const response = await fetch('/api/eleitores/exportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsParaExportar }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} eleitor(es) exportado(s) com sucesso`);
        fetchEleitores();
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar eleitores');
    } finally {
      setExporting(false);
    }
  };

  // Exportar selecionados
  const handleExportarSelecionados = () => {
    if (selectedIds.size === 0) return;

    const selecionados = eleitores.filter(e => selectedIds.has(e.id));

    const csvData = selecionados.map(e => ({
      Nome: e.nomeCompleto,
      CPF: e.cpf || '',
      Telefone: e.telefone || '',
      Cidade: e.cidade || '',
      UF: e.uf || '',
      Bairro: e.bairro || '',
      'Data Cadastro': new Date(e.createdAt).toLocaleDateString('pt-BR'),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `eleitores_selecionados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Marcar como aquecido
  const handleMarcarAquecido = async () => {
    if (selectedIds.size === 0) return;

    setAquecendo(true);
    try {
      const response = await fetch('/api/eleitores/aquecer-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), aquecido: true }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} eleitor(es) marcado(s) como aquecido(s)`);
        setSelectedIds(new Set());
        fetchEleitores();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao marcar como aquecido');
      }
    } catch (error) {
      console.error('Erro ao marcar como aquecido:', error);
      alert('Erro ao marcar como aquecido');
    } finally {
      setAquecendo(false);
    }
  };

  // Enviar campanha de email
  const handleEnviarEmail = async () => {
    if (selectedIds.size === 0) return;
    if (!emailAssunto.trim() || !emailConteudo.trim()) {
      alert('Preencha o assunto e o conteúdo do email');
      return;
    }

    // Verificar se há eleitores com email
    const selecionadosComEmail = eleitores.filter(e => selectedIds.has(e.id) && e.email);
    if (selecionadosComEmail.length === 0) {
      alert('Nenhum eleitor selecionado possui email cadastrado');
      return;
    }

    setEnviandoEmail(true);
    try {
      const response = await fetch('/api/eleitores/enviar-email-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          assunto: emailAssunto,
          conteudoHtml: emailConteudo,
          conteudoTexto: emailConteudo.replace(/<[^>]*>/g, ''),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Campanha enviada para ${result.count} eleitor(es)`);
        setShowEmailModal(false);
        setEmailAssunto('');
        setEmailConteudo('');
        setSelectedIds(new Set());
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar emails');
      }
    } catch (error) {
      console.error('Erro ao enviar emails:', error);
      alert('Erro ao enviar emails');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const toggleFiltroNovosCadastros = () => {
    setFiltroNovosCadastros(!filtroNovosCadastros);
    setCurrentPage(1);
  };

  const limparFiltros = () => {
    setFiltroGrupo('');
    setFiltroSubgrupo('');
    setFiltroBairro('');
    setFiltroAquecido('todos');
    setSortOrder('data_desc');
    setFiltroNovosCadastros(false);
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filtroGrupo || filtroSubgrupo || filtroBairro || filtroAquecido !== 'todos' || filtroNovosCadastros || search;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cadastro de Eleitores
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie o cadastro completo de eleitores
        </p>
      </div>

      {/* Barra de busca e ações principais */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium transition hover:bg-green-700"
        >
          <FileSpreadsheet className="h-5 w-5" />
          Importar
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium transition hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Novo Eleitor
        </button>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo
              </label>
              <select
                value={filtroGrupo}
                onChange={(e) => {
                  setFiltroGrupo(e.target.value);
                  setFiltroSubgrupo('');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os grupos</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </select>
            </div>

            {/* Subgrupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subgrupo
              </label>
              <select
                value={filtroSubgrupo}
                onChange={(e) => {
                  setFiltroSubgrupo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os subgrupos</option>
                {subgruposFiltrados.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            {/* Bairro/Região */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bairro/Região
              </label>
              <input
                type="text"
                value={filtroBairro}
                onChange={(e) => {
                  setFiltroBairro(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Digite o bairro..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filtro Aquecidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status Aquecido
              </label>
              <select
                value={filtroAquecido}
                onChange={(e) => {
                  setFiltroAquecido(e.target.value as 'todos' | 'aquecidos' | 'nao_aquecidos');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="todos">Todos</option>
                <option value="aquecidos">Aquecidos</option>
                <option value="nao_aquecidos">Não Aquecidos</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as SortOrder);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="data_desc">Mais recentes</option>
                <option value="data_asc">Mais antigos</option>
                <option value="nome_asc">Nome A-Z</option>
                <option value="nome_desc">Nome Z-A</option>
                <option value="cidade_asc">Cidade A-Z</option>
                <option value="cidade_desc">Cidade Z-A</option>
              </select>
            </div>

            {/* Exibição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exibição
              </label>
              <button
                onClick={() => {
                  setShowAllRecords(!showAllRecords);
                  setCurrentPage(1);
                }}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                  showAllRecords
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {showAllRecords ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showAllRecords ? 'Todos (sem scroll)' : 'Paginado (10)'}
              </button>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleFiltroNovosCadastros}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filtroNovosCadastros
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Novos (7 dias)
            </button>

            {hasActiveFilters && (
              <button
                onClick={limparFiltros}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra de ações para selecionados */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {selectedIds.size} eleitor(es) selecionado(s)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleMarcarAquecido}
              disabled={aquecendo}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {aquecendo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              Marcar Aquecido
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              <Mail className="h-4 w-4" />
              Campanha Email
            </button>
            <button
              onClick={handleExportarSelecionados}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={() => setShowDeleteManyModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Banner de filtro novos cadastros */}
      {filtroNovosCadastros && !showFilters && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-green-600" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              Mostrando novos cadastros dos últimos 7 dias que ainda não foram exportados
            </span>
          </div>
          <div className="flex gap-2">
            {eleitores.length > 0 && (
              <button
                onClick={handleExportar}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Exportar
              </button>
            )}
            <button
              onClick={() => setFiltroNovosCadastros(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Info de resultados */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {totalEleitores} eleitor(es) encontrado(s)
          {showAllRecords && totalEleitores > 0 && ` • Exibindo todos`}
        </span>
        {!showAllRecords && totalEleitores > 10 && (
          <button
            onClick={() => {
              setShowAllRecords(true);
              setCurrentPage(1);
            }}
            className="text-primary hover:underline"
          >
            Exibir todos sem paginação
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className={`overflow-x-auto ${showAllRecords && eleitores.length > 20 ? '' : ''}`}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : isSomeSelected ? (
                      <div className="w-5 h-5 border-2 border-primary bg-primary/30 rounded flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-primary" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cidade/UF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bairro
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cadastrado Por
                </th>
                {filtroNovosCadastros && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                )}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: filtroNovosCadastros ? 9 : 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : eleitores.length === 0 ? (
                <tr>
                  <td colSpan={filtroNovosCadastros ? 9 : 8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {filtroNovosCadastros
                      ? 'Nenhum novo cadastro nos últimos 7 dias'
                      : 'Nenhum eleitor encontrado'}
                  </td>
                </tr>
              ) : (
                eleitores.map((eleitor) => (
                  <tr
                    key={eleitor.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedIds.has(eleitor.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : eleitor.aquecido
                          ? 'bg-orange-50 dark:bg-orange-900/20'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(eleitor.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        {selectedIds.has(eleitor.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                        {eleitor.nomeCompleto}
                        {eleitor.aquecido && (
                          <span title={`Aquecido em ${eleitor.aquecidoEm ? new Date(eleitor.aquecidoEm).toLocaleDateString('pt-BR') : ''}`}>
                            <Flame className="h-4 w-4 text-orange-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {eleitor.cpf ? eleitor.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {eleitor.telefone}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {eleitor.cidade}/{eleitor.uf}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {eleitor.bairro || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {eleitor.criadoPor?.nome || '-'}
                      </div>
                    </td>
                    {filtroNovosCadastros && (
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {eleitor.exportado ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Exportado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                            Pendente
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(eleitor)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar eleitor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(eleitor)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir eleitor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!showAllRecords && totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages} ({totalEleitores} eleitores)
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal de cadastro */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Cadastrar Novo Eleitor"
        maxWidth="2xl"
      >
        <FormularioCadastroEleitor
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchEleitores();
          }}
        />
      </Modal>

      {/* Modal de edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEleitor(null);
        }}
        title="Editar Eleitor"
        maxWidth="2xl"
      >
        {selectedEleitor && (
          <FormularioEdicaoEleitor
            eleitorId={selectedEleitor.id}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEleitor(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedEleitor(null);
              fetchEleitores();
            }}
          />
        )}
      </Modal>

      {/* Modal de confirmação de exclusão individual */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEleitor(null);
        }}
        title="Confirmar Exclusão"
        maxWidth="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
            Excluir Eleitor
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Tem certeza que deseja excluir o eleitor{' '}
            <strong className="text-gray-900 dark:text-white">
              {selectedEleitor?.nomeCompleto}
            </strong>
            ? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedEleitor(null);
              }}
              disabled={deleting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de exclusão em lote */}
      <Modal
        isOpen={showDeleteManyModal}
        onClose={() => {
          setShowDeleteManyModal(false);
          setDeleteConfirmText('');
        }}
        title="Excluir Múltiplos Eleitores"
        maxWidth="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
            ATENÇÃO: Exclusão em Massa
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            Você está prestes a excluir{' '}
            <strong className="text-red-600 text-xl">{selectedIds.size}</strong>{' '}
            eleitor(es). Esta ação <strong>NÃO pode ser desfeita</strong>.
          </p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para confirmar, digite <strong className="text-red-600">EXCLUIR</strong>:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="Digite EXCLUIR"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-center font-mono text-lg"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteManyModal(false);
                setDeleteConfirmText('');
              }}
              disabled={deleting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteMany}
              disabled={deleting || deleteConfirmText !== 'EXCLUIR'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir {selectedIds.size} eleitor(es)
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de importação */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar Eleitores"
        maxWidth="4xl"
      >
        <ImportacaoEleitores
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchEleitores();
          }}
        />
      </Modal>

      {/* Modal de campanha de email */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmailAssunto('');
          setEmailConteudo('');
        }}
        title="Campanha de Email"
        maxWidth="2xl"
      >
        <div className="p-6">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>{selectedIds.size}</strong> eleitor(es) selecionado(s).
              {' '}
              <strong>
                {eleitores.filter(e => selectedIds.has(e.id) && e.email).length}
              </strong> possui(em) email cadastrado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assunto do Email *
              </label>
              <input
                type="text"
                value={emailAssunto}
                onChange={(e) => setEmailAssunto(e.target.value)}
                placeholder="Digite o assunto do email..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conteúdo do Email *
              </label>
              <textarea
                value={emailConteudo}
                onChange={(e) => setEmailConteudo(e.target.value)}
                placeholder="Digite o conteúdo do email (suporta HTML)..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dica: Você pode usar HTML para formatar o email (ex: &lt;b&gt;negrito&lt;/b&gt;, &lt;br&gt; para quebra de linha)
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailAssunto('');
                setEmailConteudo('');
              }}
              disabled={enviandoEmail}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviarEmail}
              disabled={enviandoEmail || !emailAssunto.trim() || !emailConteudo.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviandoEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar Campanha
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        Sistema ainda em desenvolvimento pode conter falhas.
      </div>
    </div>
  );
}
