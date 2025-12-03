'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, Link, CheckSquare, Mail, MessageCircle, RefreshCw, Map } from 'lucide-react';

interface Grupo {
  id: string;
  nome: string;
  cor: string | null;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role?: string;
  cadastradosTotal?: number;
}

interface Subgrupo {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  grupo: Grupo;
  responsavel: Usuario;
  _count: {
    eleitores: number;
    eventosPresenca: number;
  };
}

export default function SubgruposTab() {
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPresencaModal, setShowPresencaModal] = useState(false);
  const [selectedSubgrupo, setSelectedSubgrupo] = useState<Subgrupo | null>(null);
  const [editingSubgrupo, setEditingSubgrupo] = useState<Subgrupo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    grupoId: '',
    responsavelId: '',
    ativo: true,
  });
  const [eventFormData, setEventFormData] = useState({
    titulo: '',
    descricao: '',
    dataEvento: '',
    local: '',
    limite: '',
    expiraEm: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [subgruposRes, gruposRes, usuariosRes] = await Promise.all([
        fetch('/api/subgrupos'),
        fetch('/api/grupos'),
        fetch('/api/usuarios'),
      ]);

      if (subgruposRes.ok) {
        const data = await subgruposRes.json();
        setSubgrupos(Array.isArray(data) ? data : []);
      }

      if (gruposRes.ok) {
        const data = await gruposRes.json();
        setGrupos(Array.isArray(data) ? data : []);
      }

      if (usuariosRes.ok) {
        const data = await usuariosRes.json();
        console.log('Usuários carregados:', data);
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao carregar usuários:', usuariosRes.status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSubgrupo
        ? `/api/subgrupos/${editingSubgrupo.id}`
        : '/api/subgrupos';
      const method = editingSubgrupo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        carregarDados();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar subgrupo');
      }
    } catch (error) {
      console.error('Erro ao salvar subgrupo:', error);
      alert('Erro ao salvar subgrupo');
    }
  };

  const handleEdit = (subgrupo: Subgrupo) => {
    setEditingSubgrupo(subgrupo);
    setFormData({
      nome: subgrupo.nome,
      descricao: subgrupo.descricao || '',
      grupoId: subgrupo.grupo.id,
      responsavelId: subgrupo.responsavel.id,
      ativo: subgrupo.ativo,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este subgrupo?')) return;

    try {
      const response = await fetch(`/api/subgrupos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        carregarDados();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir subgrupo');
      }
    } catch (error) {
      console.error('Erro ao excluir subgrupo:', error);
      alert('Erro ao excluir subgrupo');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubgrupo(null);
    setFormData({
      nome: '',
      descricao: '',
      grupoId: '',
      responsavelId: '',
      ativo: true,
    });
  };

  const handleGerarLink = async (subgrupo: Subgrupo) => {
    setSelectedSubgrupo(subgrupo);
    setEventFormData({
      titulo: '',
      descricao: '',
      dataEvento: '',
      local: '',
      limite: '',
      expiraEm: '',
    });
    setGeneratedLink('');
    setShowEventModal(true);

    // Buscar evento ativo existente
    try {
      const response = await fetch(`/api/eventos-presenca?subgrupoId=${subgrupo.id}&ativo=true`);
      if (response.ok) {
        const eventos = await response.json();
        if (eventos && eventos.length > 0) {
          // Pega o evento mais recente
          const eventoRecente = eventos[0];
          const appUrl = window.location.origin;
          setGeneratedLink(`${appUrl}/presenca/${eventoRecente.linkUnico}`);
          // Preencher dados do formulário caso queira editar/redefinir com base no anterior (opcional)
          setEventFormData({
            titulo: eventoRecente.titulo,
            descricao: eventoRecente.descricao || '',
            dataEvento: eventoRecente.dataEvento ? new Date(eventoRecente.dataEvento).toISOString().slice(0, 16) : '',
            local: eventoRecente.local || '',
            limite: eventoRecente.limite?.toString() || '',
            expiraEm: eventoRecente.expiraEm ? new Date(eventoRecente.expiraEm).toISOString().slice(0, 16) : '',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar eventos ativos:', error);
    }
  };

  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubgrupo) return;

    try {
      const response = await fetch('/api/eventos-presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventFormData,
          subgrupoId: selectedSubgrupo.id,
          limite: eventFormData.limite ? parseInt(eventFormData.limite) : null,
        }),
      });

      if (response.ok) {
        const evento = await response.json();
        setGeneratedLink(evento.linkPublico);
        alert('Evento criado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar evento');
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento');
    }
  };

  const handleVerPresencas = (subgrupo: Subgrupo) => {
    setSelectedSubgrupo(subgrupo);
    setShowPresencaModal(true);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark dark:text-white">
            Gerenciar Subgrupos
          </h3>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            Organize subgrupos dentro dos grupos principais
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Novo Subgrupo
        </button>
      </div>

      {/* Lista de Subgrupos */}
      <div className="space-y-4">
        {subgrupos.map((subgrupo) => (
          <div
            key={subgrupo.id}
            className="rounded-lg border border-stroke p-4 dark:border-dark-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: subgrupo.grupo.cor || '#7B2CBF' }}
                  />
                  <h4 className="font-semibold text-dark dark:text-white">
                    {subgrupo.nome}
                  </h4>
                  {!subgrupo.ativo && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                      Inativo
                    </span>
                  )}
                </div>

                <p className="mb-2 text-sm text-dark-5 dark:text-dark-6">
                  Grupo: {subgrupo.grupo.nome}
                </p>

                {subgrupo.descricao && (
                  <p className="mb-2 text-sm text-dark-5 dark:text-dark-6">
                    {subgrupo.descricao}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-dark-5 dark:text-dark-6">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{subgrupo._count.eleitores} eleitores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{subgrupo._count.eventosPresenca} eventos</span>
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  <span className="text-dark-5 dark:text-dark-6">Responsável: </span>
                  <span className="font-medium text-dark dark:text-white">
                    {subgrupo.responsavel.nome}
                  </span>
                  <span className="text-dark-5 dark:text-dark-6">
                    {' '}
                    ({subgrupo.responsavel.email})
                  </span>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleGerarLink(subgrupo)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-opacity-90"
                  >
                    <Link className="h-4 w-4" />
                    Gerar Link de Convite
                  </button>
                  <button
                    onClick={() => handleVerPresencas(subgrupo)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm text-primary hover:bg-primary hover:text-white"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Ver Presenças
                  </button>
                  <a
                    href={`/dashboard/mapa?subgrupoId=${subgrupo.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm text-primary hover:bg-primary hover:text-white"
                  >
                    <Map className="h-4 w-4" />
                    Ver no Mapa
                  </a>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(subgrupo)}
                  className="p-1 text-dark-5 hover:text-primary dark:text-dark-6"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(subgrupo.id)}
                  className="p-1 text-dark-5 hover:text-red-500 dark:text-dark-6"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subgrupos.length === 0 && (
        <div className="text-center py-12 text-dark-5 dark:text-dark-6">
          Nenhum subgrupo cadastrado
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-dark">
            <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">
              {editingSubgrupo ? 'Editar Subgrupo' : 'Novo Subgrupo'}
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
                  Grupo *
                </label>
                <select
                  value={formData.grupoId}
                  onChange={(e) => setFormData({ ...formData, grupoId: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                  required
                >
                  <option value="">Selecione um grupo</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Responsável *
                </label>
                <select
                  value={formData.responsavelId}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavelId: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                  required
                >
                  <option value="">
                    {usuarios.length > 0
                      ? 'Selecione um responsável'
                      : 'Carregando usuários...'}
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome} ({usuario.email})
                    </option>
                  ))}
                </select>
                {usuarios.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    Nenhum usuário disponível. Verifique suas permissões.
                  </p>
                )}
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
                  Subgrupo ativo
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
                  {editingSubgrupo ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Evento */}
      {showEventModal && selectedSubgrupo && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">
              Gerar Link de Convite - {selectedSubgrupo.nome}
            </h3>

            {!generatedLink ? (
              <form onSubmit={handleCriarEvento} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={eventFormData.titulo}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, titulo: e.target.value })
                    }
                    className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                    placeholder="Ex: Reunião de Mobilização"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Descrição
                  </label>
                  <textarea
                    value={eventFormData.descricao}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, descricao: e.target.value })
                    }
                    className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                    rows={3}
                    placeholder="Descrição do evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Data e Hora do Evento *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventFormData.dataEvento}
                      onChange={(e) =>
                        setEventFormData({ ...eventFormData, dataEvento: e.target.value })
                      }
                      className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Local
                    </label>
                    <input
                      type="text"
                      value={eventFormData.local}
                      onChange={(e) =>
                        setEventFormData({ ...eventFormData, local: e.target.value })
                      }
                      className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                      placeholder="Endereço ou local do evento"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Limite de Participantes
                    </label>
                    <input
                      type="number"
                      value={eventFormData.limite}
                      onChange={(e) =>
                        setEventFormData({ ...eventFormData, limite: e.target.value })
                      }
                      className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                      placeholder="Deixe vazio para ilimitado"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Link Expira Em
                    </label>
                    <input
                      type="datetime-local"
                      value={eventFormData.expiraEm}
                      onChange={(e) =>
                        setEventFormData({ ...eventFormData, expiraEm: e.target.value })
                      }
                      className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2 dark:border-dark-3 dark:bg-dark-2"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 rounded-lg border border-stroke px-4 py-2 text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                  >
                    Gerar Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
                    Link de convite ativo
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm dark:border-green-700 dark:bg-dark-2"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                      title="Copiar Link"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Botões de Compartilhamento */}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Olá! Você foi convidado para o evento "${eventFormData.titulo}". Confirme sua presença aqui: ${generatedLink}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        `Convite: ${eventFormData.titulo}`
                      )}&body=${encodeURIComponent(
                        `Olá!\n\nVocê foi convidado para o evento "${eventFormData.titulo}".\n\nConfirme sua presença clicando no link abaixo:\n${generatedLink}\n\nAtenciosamente,\n${selectedSubgrupo.responsavel.nome}`
                      )}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  </div>
                </div>

                <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <h4 className="mb-2 font-semibold text-dark dark:text-white">
                    Próximos Passos:
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-dark-5 dark:text-dark-6">
                    <li>Envie o link para os participantes via WhatsApp ou Email</li>
                    <li>
                      Quando confirmarem presença, eles serão automaticamente adicionados a este
                      subgrupo
                    </li>
                    <li>Use o botão "Ver Presenças" para acompanhar as confirmações</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setGeneratedLink('')}
                    className="flex items-center justify-center gap-2 flex-1 rounded-lg border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Redefinir Link
                  </button>
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setGeneratedLink('');
                      carregarDados();
                    }}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ver Presenças */}
      {showPresencaModal && selectedSubgrupo && (
        <PresencasModal
          subgrupo={selectedSubgrupo}
          onClose={() => setShowPresencaModal(false)}
        />
      )}
    </div>
  );
}

// Componente Modal de Presenças
function PresencasModal({
  subgrupo,
  onClose,
}: {
  subgrupo: { id: string; nome: string };
  onClose: () => void;
}) {
  const [eleitores, setEleitores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEleitores();
  }, []);

  const carregarEleitores = async () => {
    try {
      const response = await fetch(`/api/eleitores?subgrupoId=${subgrupo.id}`);
      if (response.ok) {
        const data = await response.json();
        const eleitoresArray = Array.isArray(data) ? data : data.eleitores || [];
        // Filtrar apenas os que vieram de link de presença
        const eleitoresPresenca = eleitoresArray.filter(
          (e: any) => e.origem === 'link_presenca'
        );
        setEleitores(eleitoresPresenca);
      }
    } catch (error) {
      console.error('Erro ao carregar eleitores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">
          Presenças Confirmadas - {subgrupo.nome}
        </h3>

        {loading ? (
          <div className="py-12 text-center">Carregando...</div>
        ) : eleitores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="pb-3 text-left text-sm font-semibold text-dark dark:text-white">
                    Nome
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-dark dark:text-white">
                    Telefone
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-dark dark:text-white">
                    Email
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-dark dark:text-white">
                    Cidade
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-dark dark:text-white">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {eleitores.map((eleitor) => (
                  <tr
                    key={eleitor.id}
                    className="border-b border-stroke dark:border-dark-3"
                  >
                    <td className="py-3 text-sm text-dark dark:text-white">
                      {eleitor.nomeCompleto}
                    </td>
                    <td className="py-3 text-sm text-dark-5 dark:text-dark-6">
                      {eleitor.telefone}
                    </td>
                    <td className="py-3 text-sm text-dark-5 dark:text-dark-6">
                      {eleitor.email || '-'}
                    </td>
                    <td className="py-3 text-sm text-dark-5 dark:text-dark-6">
                      {eleitor.cidade}
                    </td>
                    <td className="py-3 text-sm text-dark-5 dark:text-dark-6">
                      {new Date(eleitor.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-dark-5 dark:text-dark-6">
            Nenhuma presença confirmada ainda
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div className="text-sm text-dark-5 dark:text-dark-6">
            Total: {eleitores.length} pessoa(s)
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
