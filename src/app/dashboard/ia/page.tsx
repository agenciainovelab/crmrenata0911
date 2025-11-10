'use client';

import { useState } from 'react';
import { Brain, Send, Loader2, Sparkles, TrendingUp, Users, Target, MessageSquare, Lightbulb, BarChart } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Erro: ${data.error}` }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erro ao conectar com a IA' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'Como segmentar eleitores por região?',
    'Qual o melhor horário para enviar mensagens?',
    'Como analisar dados de engajamento?',
    'Estratégias para aumentar participação',
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-politico-roxo to-politico-roxo-escuro rounded-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inteligência Artificial
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análise inteligente de campanhas com ChatGPT
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
            {/* Header do Chat */}
            <div className="bg-gradient-to-r from-politico-roxo to-politico-roxo-escuro p-4">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold">Assistente de Campanha IA</h2>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Brain className="w-16 h-16 text-politico-roxo mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Como posso ajudar?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Faça perguntas sobre estratégias de campanha, análise de dados ou segmentação de eleitores
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                    {suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(question)}
                        className="p-3 text-sm text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-politico-roxo transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-politico-roxo to-politico-roxo-escuro text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-politico-roxo" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua pergunta..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-politico-roxo dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-politico-roxo to-politico-roxo-escuro text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar com Recursos */}
        <div className="space-y-4">
          {/* Análises Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-politico-roxo" />
              Análises Rápidas
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-sm transition-colors">
                <div className="font-medium text-politico-roxo">Análise de Engajamento</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Últimos 30 dias
                </div>
              </button>
              <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm transition-colors">
                <div className="font-medium text-politico-azul">Segmentação Geográfica</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Por cidade/região
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-sm transition-colors">
                <div className="font-medium text-green-600">Previsão de Resultados</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Baseado em dados
                </div>
              </button>
            </div>
          </div>

          {/* Insights Recentes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Insights Recentes
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Melhor horário:</strong> 18h-20h para WhatsApp (+15% abertura)
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Segmento 'Líderes':</strong> Maior engajamento em emails
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Recomendação:</strong> Aumentar frequência com grupo 'Pessoas'
                </p>
              </div>
            </div>
          </div>

          {/* Módulos IA */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Módulos Disponíveis
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { icon: TrendingUp, label: 'Análise Preditiva', progress: 53 },
                { icon: Users, label: 'Segmentação Inteligente', progress: 46 },
                { icon: Target, label: 'Otimização de Campanhas', progress: 57 },
                { icon: MessageSquare, label: 'Análise de Sentimento', progress: 35 },
              ].map((module, i) => {
                const Icon = module.icon;
                return (
                  <div key={i} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-politico-roxo" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {module.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-politico-roxo h-1.5 rounded-full"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        Campanha Inteligente © 2025
      </div>
    </div>
  );
}
