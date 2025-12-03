'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Link2, Mail, MessageCircle, MapPin, Clock, Edit2, Trash2, Map } from 'lucide-react';

interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
  local: string | null;
  linkUnico: string;
  ativo: boolean;
  limite: number | null;
  totalConfirmacoes: number;
  expiraEm: string | null;
  subgrupo: {
    id: string;
    nome: string;
    grupo: {
      nome: string;
      cor: string | null;
    };
  };
}

export default function ReunioesPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataEvento: '',
    local: '',
    limite: '',
    ativo: true,
  });

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const response = await fetch('/api/eventos-presenca');
      if (response.ok) {
        const data = await response.json();
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      dataEvento: new Date(evento.dataEvento).toISOString().slice(0, 16),
      local: evento.local || '',
      limite: evento.limite?.toString() || '',
      ativo: evento.ativo,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${titulo}"?`)) return;

    try {
      const response = await fetch(`/api/eventos-presenca/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Evento excluído com sucesso!');
        carregarEventos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir evento');
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvento) return;

    try {
      const response = await fetch(`/api/eventos-presenca/${editingEvento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          limite: formData.limite ? parseInt(formData.limite) : null,
        }),
      });

      if (response.ok) {
        alert('Evento atualizado com sucesso!');
        setShowEditModal(false);
        carregarEventos();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar evento');
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento');
    }
  };

  const handleVerMapa = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowMapModal(true);
  };

  const handleCopyLink = (linkUnico: string) => {
    const appUrl = window.location.origin;
    const link = `${appUrl}/presenca/${linkUnico}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  };

  const handleWhatsApp = (evento: Evento) => {
    const appUrl = window.location.origin;
    const link = `${appUrl}/presenca/${evento.linkUnico}`;
    const mensagem = `Olá! Você foi convidado para "${evento.titulo}". Confirme sua presença: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleEmail = (evento: Evento) => {
    const appUrl = window.location.origin;
    const link = `${appUrl}/presenca/${evento.linkUnico}`;
    const subject = `Convite: ${evento.titulo}`;
    const body = `Olá!\n\nVocê foi convidado para "${evento.titulo}".\n\nConfirme sua presença: ${link}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-3 dark:bg-dark-3"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Reuniões e Eventos</h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Gerencie links de convite e acompanhe confirmações de presença
          </p>
        </div>
        <a
          href="/dashboard/configuracoes?tab=subgrupos"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          <Plus className="h-5 w-5" />
          Criar Evento
        </a>
      </div>

      {/* Lista de Eventos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((evento) => {
          const dataEvento = new Date(evento.dataEvento);
          const expirado = evento.expiraEm && new Date(evento.expiraEm) < new Date();
          const limitAtingido = evento.limite && evento.totalConfirmacoes >= evento.limite;
          const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const linkPublico = `${appUrl}/presenca/${evento.linkUnico}`;

          return (
            <div
              key={evento.id}
              className="rounded-xl border border-stroke bg-white p-6 shadow-card dark:border-dark-3 dark:bg-gray-dark"
            >
              {/* Header com cor do grupo e botões de ação */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: evento.subgrupo.grupo.cor || '#7B2CBF' }}
                    />
                    <span className="text-xs text-dark-5 dark:text-dark-6">
                      {evento.subgrupo.grupo.nome} • {evento.subgrupo.nome}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark dark:text-white">
                    {evento.titulo}
                  </h3>
                  {evento.descricao && (
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      {evento.descricao}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(evento)}
                    className="p-1.5 text-dark-5 hover:text-primary dark:text-dark-6"
                    title="Editar evento"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id, evento.titulo)}
                    className="p-1.5 text-dark-5 hover:text-red-500 dark:text-dark-6"
                    title="Excluir evento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Badges de Status */}
              <div className="mb-4 flex gap-2">
                {!evento.ativo && (
                  <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                    Inativo
                  </span>
                )}
                {expirado && (
                  <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-600">
                    Expirado
                  </span>
                )}
              </div>

              {/* Informações do Evento */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-5 dark:text-dark-6">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {dataEvento.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    às{' '}
                    {dataEvento.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {evento.local && (
                  <div className="flex items-center gap-2 text-dark-5 dark:text-dark-6">
                    <MapPin className="h-4 w-4" />
                    <span>{evento.local}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-dark-5 dark:text-dark-6">
                  <Users className="h-4 w-4" />
                  <span>
                    {evento.totalConfirmacoes} confirmações
                    {evento.limite && ` / ${evento.limite} vagas`}
                  </span>
                </div>

                {evento.expiraEm && (
                  <div className="flex items-center gap-2 text-dark-5 dark:text-dark-6">
                    <Clock className="h-4 w-4" />
                    <span>
                      Expira em{' '}
                      {new Date(evento.expiraEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {evento.limite && (
                <div className="mb-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-dark-3">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          (evento.totalConfirmacoes / evento.limite) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {limitAtingido && (
                <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                  Limite de participantes atingido
                </div>
              )}

              {/* Link de Compartilhamento */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-dark-5 dark:text-dark-6">
                  Link de Convite
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={linkPublico}
                    readOnly
                    className="flex-1 rounded-lg border border-stroke bg-gray-1 px-3 py-2 text-xs dark:border-dark-3 dark:bg-dark-2"
                  />
                  <button
                    onClick={() => handleCopyLink(evento.linkUnico)}
                    className="rounded-lg bg-gray-500 p-2 text-white hover:bg-opacity-90"
                    title="Copiar Link"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleWhatsApp(evento)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm text-white hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleEmail(evento)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {eventos.length === 0 && (
        <div className="rounded-xl border border-stroke bg-white p-12 text-center dark:border-dark-3 dark:bg-gray-dark">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-dark-5" />
          <h3 className="mb-2 text-lg font-bold text-dark dark:text-white">
            Nenhum evento criado
          </h3>
          <p className="mb-4 text-sm text-dark-5 dark:text-dark-6">
            Crie eventos e reuniões para gerar links de convite e acompanhar confirmações
          </p>
          <a
            href="/dashboard/configuracoes?tab=subgrupos"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
          >
            <Plus className="h-5 w-5" />
            Criar Primeiro Evento
          </a>
        </div>
      )}
    </div>
  );
}
