'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';

interface EventoPresenca {
  id: string;
  titulo: string;
  descricao: string | null;
  dataEvento: string;
  local: string | null;
  limite: number | null;
  totalConfirmacoes: number;
  subgrupo: {
    id: string;
    nome: string;
    grupo: {
      id: string;
      nome: string;
      cor: string | null;
    };
    responsavel: {
      nome: string;
      telefone: string | null;
    };
  };
}

export default function PresencaPublicaPage() {
  const params = useParams();
  const token = params.token as string;

  const [evento, setEvento] = useState<EventoPresenca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    genero: 'NAO_INFORMAR',
    cidade: '',
  });

  useEffect(() => {
    carregarEvento();
  }, [token]);

  const carregarEvento = async () => {
    try {
      console.log('Carregando evento com token:', token);
      const response = await fetch(`/api/presenca/${token}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro na resposta:', error);
        setError(error.error || 'Erro ao carregar evento');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Evento carregado:', data);
      setEvento(data);
    } catch (err) {
      console.error('Erro ao carregar evento:', err);
      setError('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/presenca/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Erro ao confirmar presença');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro ao confirmar presença');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-1">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-dark-5">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-1 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-dark">Erro</h1>
          <p className="text-dark-5">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-1 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold text-dark">Presença Confirmada!</h1>
          <p className="mb-4 text-dark-5">
            Sua presença no evento <strong>{evento?.titulo}</strong> foi confirmada com sucesso.
          </p>
          <p className="text-sm text-dark-5">
            Em breve você receberá mais informações sobre o evento.
          </p>
        </div>
      </div>
    );
  }

  if (!evento) return null;

  const dataEvento = new Date(evento.dataEvento);
  const vagasRestantes = evento.limite
    ? evento.limite - evento.totalConfirmacoes
    : null;

  return (
    <div className="min-h-screen bg-gray-1 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Cabeçalho do Evento */}
        <div
          className="mb-6 rounded-lg p-6 text-white shadow-lg"
          style={{ backgroundColor: evento.subgrupo.grupo.cor || '#7B2CBF' }}
        >
          <h1 className="mb-2 text-3xl font-bold">{evento.titulo}</h1>
          {evento.descricao && (
            <p className="mb-4 text-white/90">{evento.descricao}</p>
          )}

          <div className="space-y-2 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {dataEvento.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {evento.local && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{evento.local}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>
                {evento.totalConfirmacoes} confirmações
                {vagasRestantes !== null && ` • ${vagasRestantes} vagas restantes`}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/20 pt-4">
            <p className="text-sm text-white/80">
              Grupo: {evento.subgrupo.grupo.nome} • Subgrupo: {evento.subgrupo.nome}
            </p>
            <p className="text-sm text-white/80">
              Responsável: {evento.subgrupo.responsavel.nome}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-dark">Confirme sua presença</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nomeCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nomeCompleto: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">
                Telefone/WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  setFormData({ ...formData, dataNascimento: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Gênero *</label>
              <select
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
                required
              >
                <option value="NAO_INFORMAR">Prefiro não informar</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Cidade *</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-gray-1 px-4 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Confirmando...' : 'Confirmar Presença'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
