# Sistema Político - Campanha Inteligente 🗳️

Painel administrativo completo para gestão de campanhas políticas inteligentes desenvolvido em Next.js 15 com App Router, TypeScript e Tailwind CSS.

![Logo Renata Daguiar](public/images/logo/logo-politico.png)

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar aplicação
http://localhost:3000
```

## 🔐 Login

A primeira tela é o **login** (sem menu ou header). Use qualquer email/senha para entrar (autenticação simulada).

Após o login, você terá acesso ao dashboard completo com sidebar, header e todos os módulos.

## 📊 Módulos Disponíveis

O sistema possui os seguintes módulos totalmente funcionais:

- **Dashboard**: Visão geral com estatísticas, gráficos e notificações
- **Usuários**: Gestão de Super Admins, Admins, Líderes e Pessoas
- **Hierarquia**: Árvore visual de relacionamentos (quem cadastrou quem)
- **Campanhas**: Criação e gestão de campanhas multicanal (WhatsApp, Email, Voz)
- **Comunicação**: Envio de mensagens por diferentes canais
- **IA e Análises**: Recursos de inteligência artificial em desenvolvimento
- **Relatórios**: Gráficos e análises de dados da campanha
- **Configurações**: Permissões, tema e integrações

## 🎨 Características

### Paleta Política
- Roxo Principal: `#7B2CBF`
- Roxo Escuro: `#3A0CA3`
- Azul: `#3B82F6`

### Experiência do Usuário
- ✅ Skeleton loaders em todas as transições
- ✅ Contadores de progresso animados
- ✅ Design responsivo (desktop, tablet, mobile)
- ✅ Modo escuro completo
- ✅ Logo personalizada da Renata Daguiar
- ✅ Footer: "Campanha Inteligente © 2025"

## 🛠️ Tecnologias

- Next.js 15.1.6 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (ícones)

## 📁 Estrutura

```
src/
├── app/
│   ├── auth/sign-in/          # Tela de login (primeira página)
│   └── dashboard/             # Área protegida com todos os módulos
├── components/
│   ├── Auth/                  # Componentes de autenticação
│   ├── Dashboard/             # Componentes do dashboard
│   └── Layouts/               # Header e Sidebar
└── middleware.ts              # Proteção de rotas
```

## 📖 Documentação Completa

Veja [DOCUMENTACAO.md](DOCUMENTACAO.md) para informações detalhadas sobre:
- Todos os módulos e funcionalidades
- Estrutura de arquivos completa
- Fluxo de autenticação
- Componentes visuais
- Próximos passos para integração

## 🔄 Fluxo de Uso

1. Acesso inicial → Tela de login (sem menu)
2. Login → Dashboard com sidebar e header
3. Navegação entre módulos com skeletons
4. Logout → Retorna para login

## 🎯 Pronto para Integração

Este é um **frontend completo** pronto para ser integrado com:
- Backend real (API REST/GraphQL)
- Autenticação JWT
- Banco de dados
- WhatsApp Business API
- Serviços de email
- IA real para análises

---

**Campanha Inteligente © 2025**

*Baseado no template NextAdminHQ - veja [README-ORIGINAL.md](README-ORIGINAL.md) para informações do template base.*
