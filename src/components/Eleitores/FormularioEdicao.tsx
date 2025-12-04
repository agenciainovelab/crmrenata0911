'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, FileText, Loader2, CheckCircle, Users } from 'lucide-react';

interface Grupo {
  id: string;
  nome: string;
  cor?: string;
  ativo: boolean;
}

interface Subgrupo {
  id: string;
  nome: string;
  grupoId: string;
  ativo: boolean;
}

interface FormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  genero: string;
  escolaridade: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  zonaEleitoral: string;
  secao: string;
  grupoId: string;
  subgrupoId: string;
  criadoPorId: string;
}

interface Props {
  eleitorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormularioEdicaoEleitor({ eleitorId, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [subgruposFiltrados, setSubgruposFiltrados] = useState<Subgrupo[]>([]);

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    genero: 'NAO_INFORMAR',
    escolaridade: 'MEDIO_COMPLETO',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    zonaEleitoral: '',
    secao: '',
    grupoId: '',
    subgrupoId: '',
    criadoPorId: '',
  });

  const tabs = [
    { id: 0, label: 'Dados Pessoais', icon: User },
    { id: 1, label: 'Endereço', icon: MapPin },
    { id: 2, label: 'Organização', icon: Users },
    { id: 3, label: 'Dados Eleitorais', icon: FileText },
  ];

  // Carregar dados do eleitor e grupos/subgrupos ao montar
  useEffect(() => {
    carregarDados();
  }, [eleitorId]);

  // Filtrar subgrupos quando o grupo mudar
  useEffect(() => {
    if (formData.grupoId) {
      const filtrados = subgrupos.filter(s => s.grupoId === formData.grupoId);
      setSubgruposFiltrados(filtrados);
    } else {
      setSubgruposFiltrados([]);
    }
  }, [formData.grupoId, subgrupos]);

  const carregarDados = async () => {
    setLoadingData(true);
    try {
      // Carregar grupos, subgrupos e dados do eleitor em paralelo
      const [gruposRes, subgruposRes, eleitorRes] = await Promise.all([
        fetch('/api/grupos'),
        fetch('/api/subgrupos'),
        fetch(`/api/eleitores/${eleitorId}`),
      ]);

      if (gruposRes.ok) {
        const gruposData = await gruposRes.json();
        setGrupos(gruposData.filter((g: Grupo) => g.ativo !== false));
      }

      if (subgruposRes.ok) {
        const subgruposData = await subgruposRes.json();
        setSubgrupos(subgruposData.filter((s: Subgrupo) => s.ativo !== false));
      }

      if (eleitorRes.ok) {
        const eleitor = await eleitorRes.json();

        // Formatar data para input date
        const dataNascimento = eleitor.dataNascimento
          ? new Date(eleitor.dataNascimento).toISOString().split('T')[0]
          : '';

        setFormData({
          nomeCompleto: eleitor.nomeCompleto || '',
          cpf: eleitor.cpf || '',
          dataNascimento,
          telefone: eleitor.telefone || '',
          email: eleitor.email || '',
          genero: eleitor.genero || 'NAO_INFORMAR',
          escolaridade: eleitor.escolaridade || 'MEDIO_COMPLETO',
          cep: eleitor.cep || '',
          logradouro: eleitor.logradouro || '',
          numero: eleitor.numero || '',
          complemento: eleitor.complemento || '',
          bairro: eleitor.bairro || '',
          cidade: eleitor.cidade || '',
          uf: eleitor.uf || '',
          zonaEleitoral: eleitor.zonaEleitoral || '',
          secao: eleitor.secao || '',
          grupoId: eleitor.grupoId || '',
          subgrupoId: eleitor.subgrupoId || '',
          criadoPorId: eleitor.criadoPorId || '',
        });
      } else {
        alert('Erro ao carregar dados do eleitor');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se mudou o grupo, limpar o subgrupo
    if (name === 'grupoId') {
      setFormData(prev => ({ ...prev, subgrupoId: '' }));
    }
  };

  const buscarCep = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`/api/cep/${cep}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          uf: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setLoadingStep('Atualizando dados...');

      const response = await fetch(`/api/eleitores/${eleitorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ''),
          cep: formData.cep.replace(/\D/g, ''),
          grupoId: formData.grupoId || undefined,
          subgrupoId: formData.subgrupoId || undefined,
        }),
      });

      if (response.ok) {
        setLoadingStep('Concluído!');
        await new Promise((resolve) => setTimeout(resolve, 500));
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar eleitor');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar eleitor');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Carregando dados do eleitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Aba 1: Dados Pessoais */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CPF *
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
                maxLength={14}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gênero *
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
                <option value="NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Escolaridade *
              </label>
              <select
                name="escolaridade"
                value={formData.escolaridade}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="FUNDAMENTAL_INCOMPLETO">Fundamental Incompleto</option>
                <option value="FUNDAMENTAL_COMPLETO">Fundamental Completo</option>
                <option value="MEDIO_INCOMPLETO">Médio Incompleto</option>
                <option value="MEDIO_COMPLETO">Médio Completo</option>
                <option value="SUPERIOR_INCOMPLETO">Superior Incompleto</option>
                <option value="SUPERIOR_COMPLETO">Superior Completo</option>
                <option value="POS_GRADUACAO">Pós-graduação</option>
                <option value="MESTRADO">Mestrado</option>
                <option value="DOUTORADO">Doutorado</option>
              </select>
            </div>
          </div>
        )}

        {/* Aba 2: Endereço */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CEP *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  onBlur={buscarCep}
                  placeholder="00000-000"
                  required
                  maxLength={9}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={buscarCep}
                  disabled={loadingCep}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loadingCep ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logradouro *
              </label>
              <input
                type="text"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número *
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                UF *
              </label>
              <input
                type="text"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                required
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white uppercase"
              />
            </div>
          </div>
        )}

        {/* Aba 3: Organização */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo
              </label>
              <select
                name="grupoId"
                value={formData.grupoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecione um grupo (opcional)</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subgrupo
              </label>
              <select
                name="subgrupoId"
                value={formData.subgrupoId}
                onChange={handleChange}
                disabled={!formData.grupoId || subgruposFiltrados.length === 0}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.grupoId
                    ? 'Selecione um grupo primeiro'
                    : subgruposFiltrados.length === 0
                      ? 'Nenhum subgrupo disponível'
                      : 'Selecione um subgrupo (opcional)'}
                </option>
                {subgruposFiltrados.map((subgrupo) => (
                  <option key={subgrupo.id} value={subgrupo.id}>
                    {subgrupo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <strong>Dica:</strong> Vincular o eleitor a um grupo e subgrupo facilita a organização e permite gerar relatórios segmentados.
              </p>
            </div>
          </div>
        )}

        {/* Aba 4: Dados Eleitorais */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zona Eleitoral
              </label>
              <input
                type="text"
                name="zonaEleitoral"
                value={formData.zonaEleitoral}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seção
              </label>
              <input
                type="text"
                name="secao"
                value={formData.secao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Informação:</strong> Os dados eleitorais são opcionais.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between -mx-6 -mb-6 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab - 1)}
                disabled={loading}
                className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
              >
                Anterior
              </button>
            )}

            {activeTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {loadingStep}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
