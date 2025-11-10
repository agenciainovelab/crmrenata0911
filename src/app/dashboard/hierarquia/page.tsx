'use client';

import { useState, useEffect } from 'react';
import { Network, RefreshCw, Search, Users } from 'lucide-react';
import TreeNode from '@/components/Hierarquia/TreeNode';

interface Eleitor {
  id: string;
  nomeCompleto: string;
  cidade: string;
  uf: string;
  tipo: 'eleitor';
}

interface HierarchyNode {
  id: string;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'LIDER';
  tipo: 'usuario';
  eleitores: Eleitor[];
  subordinados: HierarchyNode[];
}

export default function HierarquiaPage() {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalEleitores: 0,
    superAdmins: 0,
    admins: 0,
    lideres: 0,
  });

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hierarquia');
      const data = await response.json();
      setHierarchy(Array.isArray(data) ? data : [data]);
      
      // Calcular estatísticas
      calculateStats(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Erro ao carregar hierarquia:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (nodes: HierarchyNode[]) => {
    let totalUsuarios = 0;
    let totalEleitores = 0;
    let superAdmins = 0;
    let admins = 0;
    let lideres = 0;

    const countNode = (node: HierarchyNode) => {
      totalUsuarios++;
      totalEleitores += node.eleitores.length;
      
      if (node.role === 'SUPER_ADMIN') superAdmins++;
      if (node.role === 'ADMIN') admins++;
      if (node.role === 'LIDER') lideres++;
      
      node.subordinados.forEach(countNode);
    };

    nodes.forEach(countNode);
    
    setStats({
      totalUsuarios,
      totalEleitores,
      superAdmins,
      admins,
      lideres,
    });
  };

  const filteredHierarchy = hierarchy.filter(node =>
    node.nome.toLowerCase().includes(search.toLowerCase()) ||
    node.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-8 h-8 text-politico-roxo" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hierarquia de Relacionamentos
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Visualização completa de quem cadastrou quem no sistema
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuários</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsuarios}
              </p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-politico-roxo-escuro/10 dark:bg-politico-roxo-escuro/20 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-politico-roxo-escuro dark:text-purple-300">Super Admins</p>
              <p className="text-2xl font-bold text-politico-roxo-escuro dark:text-white">
                {stats.superAdmins}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-politico-roxo-escuro flex items-center justify-center text-white font-bold">
              S
            </div>
          </div>
        </div>

        <div className="bg-politico-roxo/10 dark:bg-politico-roxo/20 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-politico-roxo dark:text-purple-300">Admins</p>
              <p className="text-2xl font-bold text-politico-roxo dark:text-white">
                {stats.admins}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-politico-roxo flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>

        <div className="bg-purple-400/10 dark:bg-purple-400/20 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-300">Líderes</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-white">
                {stats.lideres}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold">
              L
            </div>
          </div>
        </div>

        <div className="bg-politico-azul/10 dark:bg-politico-azul/20 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-politico-azul dark:text-blue-300">Eleitores</p>
              <p className="text-2xl font-bold text-politico-azul dark:text-white">
                {stats.totalEleitores}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-politico-azul flex items-center justify-center text-white font-bold">
              E
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-politico-roxo dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={fetchHierarchy}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-politico-roxo to-politico-roxo-escuro text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Legenda de cores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Legenda de Cores:
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-politico-roxo-escuro" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Super Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-politico-roxo" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Líder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Pessoa</span>
          </div>
        </div>
      </div>

      {/* Árvore hierárquica */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-politico-roxo animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Carregando hierarquia...
              </p>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredHierarchy.length === 0 ? (
          <div className="text-center py-12">
            <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum usuário encontrado na hierarquia
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHierarchy.map((node) => (
              <TreeNode key={node.id} node={node} level={0} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        Campanha Inteligente © 2025
      </div>
    </div>
  );
}
