'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  ativo: boolean;
  _count: {
    subgrupos: number;
    eleitores: number;
  };
}

export default function GruposTab() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#7B2CBF',
    ativo: true,
  });

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    try {
      const response = await fetch('/api/grupos');
      if (response.ok) {
        const data = await response.json();
        setGrupos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingGrupo ? `/api/grupos/${editingGrupo.id}` : '/api/grupos';
      const method = editingGrupo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        carregarGrupos();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar grupo');
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      alert('Erro ao salvar grupo');
    }
  };

  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      nome: grupo.nome,
      descricao: grupo.descricao || '',
      cor: grupo.cor || '#7B2CBF',
      ativo: grupo.ativo,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        carregarGrupos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir grupo');
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      alert('Erro ao excluir grupo');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    setFormData({
      nome: '',
      descricao: '',
      cor: '#7B2CBF',
      ativo: true,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark dark:text-white">
            Gerenciar Grupos
          </h3>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            Organize seus eleitores em grupos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Novo Grupo
        </button>
      </div>

      {/* Lista de Grupos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="rounded-lg border border-stroke p-4 dark:border-dark-3"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg"
                  style={{ backgroundColor: grupo.cor || '#7B2CBF' }}
                />
                <div>
                  <h4 className="font-semibold text-dark dark:text-white">
                    {grupo.nome}
                  </h4>
                  {grupo.descricao && (
                    <p className="text-xs text-dark-5 dark:text-dark-6">
                      {grupo.descricao}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(grupo)}
                  className="p-1 text-dark-5 hover:text-primary dark:text-dark-6"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(grupo.id)}
                  className="p-1 text-dark-5 hover:text-red-500 dark:text-dark-6"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-dark-5 dark:text-dark-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{grupo._count.eleitores} eleitores</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{grupo._count.subgrupos} subgrupos</span>
              </div>
            </div>

            {!grupo.ativo && (
              <div className="mt-2">
                <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-600">
                  Inativo
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-12 text-dark-5 dark:text-dark-6">
          Nenhum grupo cadastrado
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-dark">
            <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">
              {editingGrupo ? 'Editar Grupo' : 'Novo Grupo'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Cor
                </label>
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="h-10 w-full rounded-lg border border-stroke dark:border-dark-3"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="ativo" className="text-sm text-dark dark:text-white">
                  Grupo ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-stroke px-4 py-2 text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                  {editingGrupo ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
