'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Users, MapPin } from 'lucide-react';

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

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
}

// Cores por nível hierárquico
const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        bg: 'bg-politico-roxo-escuro',
        border: 'border-politico-roxo-escuro',
        text: 'text-politico-roxo-escuro',
        bgLight: 'bg-politico-roxo-escuro/10',
        label: 'Super Admin',
      };
    case 'ADMIN':
      return {
        bg: 'bg-politico-roxo',
        border: 'border-politico-roxo',
        text: 'text-politico-roxo',
        bgLight: 'bg-politico-roxo/10',
        label: 'Admin',
      };
    case 'LIDER':
      return {
        bg: 'bg-purple-400',
        border: 'border-purple-400',
        text: 'text-purple-400',
        bgLight: 'bg-purple-400/10',
        label: 'Líder',
      };
    default:
      return {
        bg: 'bg-gray-400',
        border: 'border-gray-400',
        text: 'text-gray-400',
        bgLight: 'bg-gray-400/10',
        label: 'Pessoa',
      };
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const [expanded, setExpanded] = useState(level === 0); // Primeiro nível sempre expandido
  const [loadingEleitores, setLoadingEleitores] = useState(false);
  const [showEleitores, setShowEleitores] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const colors = getRoleColor(node.role);
  const hasChildren = node.subordinados.length > 0 || node.eleitores.length > 0;
  
  const handleToggle = async () => {
    if (!expanded && hasChildren) {
      setLoadingProgress(0);
      setExpanded(true);
      
      // Simular loading numérico
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 33;
        });
      }, 100);
    } else {
      setExpanded(!expanded);
    }
  };
  
  const handleToggleEleitores = () => {
    if (!showEleitores) {
      setLoadingEleitores(true);
      setTimeout(() => {
        setLoadingEleitores(false);
        setShowEleitores(true);
      }, 500);
    } else {
      setShowEleitores(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Linha vertical conectando nós */}
      {level > 0 && (
        <div 
          className={`absolute left-0 top-0 w-0.5 h-6 ${colors.bg}`}
          style={{ marginLeft: `${(level - 1) * 2}rem` }}
        />
      )}
      
      {/* Nó do usuário */}
      <div 
        className="flex items-start gap-3 mb-2"
        style={{ marginLeft: `${level * 2}rem` }}
      >
        {/* Botão de expansão */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`mt-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${colors.text}`}
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-7" />}
        
        {/* Card do usuário */}
        <div className={`flex-1 p-4 rounded-lg border-2 ${colors.border} ${colors.bgLight} hover:shadow-md transition-all`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                {node.nome.charAt(0).toUpperCase()}
              </div>
              
              {/* Informações */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {node.nome}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} text-white`}>
                    {colors.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {node.email}
                </p>
                
                {/* Estatísticas */}
                <div className="flex gap-4 mt-2">
                  {node.subordinados.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{node.subordinados.length} subordinado(s)</span>
                    </div>
                  )}
                  {node.eleitores.length > 0 && (
                    <button
                      onClick={handleToggleEleitores}
                      className="flex items-center gap-1 text-sm text-politico-azul hover:underline"
                    >
                      <User className="w-4 h-4" />
                      <span>{node.eleitores.length} eleitor(es)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading progress */}
          {expanded && loadingProgress < 100 && loadingProgress > 0 && (
            <div className="mt-3 text-center">
              <p className={`text-sm font-medium ${colors.text}`}>
                Carregando {loadingProgress}%...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${colors.bg} transition-all duration-300`}
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Lista de eleitores */}
          {showEleitores && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Eleitores Cadastrados:
              </h4>
              {loadingEleitores ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {node.eleitores.map((eleitor) => (
                    <div
                      key={eleitor.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-gray-700 dark:text-gray-300">
                        {eleitor.nomeCompleto}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {eleitor.cidade}/{eleitor.uf}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Nós filhos (subordinados) */}
      {expanded && node.subordinados.length > 0 && (
        <div className="relative">
          {node.subordinados.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
