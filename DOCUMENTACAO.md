# Sistema Político - Campanha Inteligente

## 📋 Descrição

Painel administrativo completo para gestão de campanhas políticas inteligentes desenvolvido em **Next.js 15** com **App Router**, **TypeScript** e **Tailwind CSS**. O sistema foi personalizado a partir do template NextAdminHQ para atender especificamente às necessidades de campanhas políticas modernas.

## 🎨 Características Visuais

### Paleta de Cores Política
- **Roxo Principal**: `#7B2CBF`
- **Roxo Escuro**: `#3A0CA3`
- **Azul Notificações**: `#3B82F6`
- **Fundo Claro**: `#F9FAFB`

### Logo
- Logo personalizada da **Renata Daguiar** integrada em toda a aplicação
- Localização: `/public/images/logo/logo-politico.png`

### Experiência do Usuário
- **Skeleton Loaders**: Animações de carregamento em todas as transições
- **Contadores de Progresso**: Feedback visual durante operações
- **Design Responsivo**: Adaptado para desktop, tablet e mobile
- **Modo Escuro**: Suporte completo a tema dark

## 🔐 Autenticação

### Tela de Login
- **Primeira tela do sistema** (sem sidebar/header)
- Campos: Email e Senha
- Skeleton de 2 segundos após submissão
- Redirecionamento automático para dashboard após login
- Footer: "Campanha Inteligente © 2025"

### Credenciais de Teste
Qualquer email/senha funciona (autenticação simulada)

### Fluxo de Autenticação
1. Acesso inicial → Redirecionado para `/auth/sign-in`
2. Login bem-sucedido → Redirecionado para `/dashboard`
3. Logout → Retorna para `/auth/sign-in`

## 📊 Módulos do Sistema

### 1. Dashboard
**Rota**: `/dashboard`

**Funcionalidades**:
- Cards estatísticos com números de:
  - Super Admins (8)
  - Admins (35)
  - Líderes (128)
  - Pessoas (890)
- Gráfico de crescimento com dados fictícios (Jan-Jun)
- Notificações em tempo real com ícones coloridos
- Skeleton loaders em todos os widgets

### 2. Usuários
**Rota**: `/dashboard/usuarios`

**Funcionalidades**:
- Listagem de usuários com filtros
- Busca por nome ou email
- Filtro por tipo: Super Admins, Admins, Líderes, Pessoas
- Botão "Novo Usuário"
- Tabela com colunas:
  - Nome
  - Email
  - Tipo (com badges coloridas)
  - Cadastrado Por
  - Cadastrados (contador)
  - Ações (Editar/Excluir)

### 3. Hierarquia
**Rota**: `/dashboard/hierarquia`

**Funcionalidades**:
- Visualização em árvore de relacionamentos
- Legenda de cores por nível:
  - **Roxo Escuro** → Super Admin
  - **Roxo Médio** → Admin
  - **Lilás** → Líder
  - **Cinza** → Pessoa
- Expansão de nós com contador de carregamento
- Visualização de "quem cadastrou quem"

### 4. Campanhas
**Rota**: `/dashboard/campanhas`

**Funcionalidades**:
- Cards de estatísticas:
  - Total de Envios
  - Campanhas Agendadas
  - Campanhas Concluídas
- Listagem de campanhas com:
  - Nome da campanha
  - Público-alvo
  - Data de envio
  - Status (Agendada/Concluída/Enviando)
  - Número de envios
- Botão "Nova Campanha"
- Tipos de campanha: WhatsApp, E-mail, Voz

### 5. Comunicação
**Rota**: `/dashboard/comunicacao`

**Funcionalidades**:
- Submenus para canais:
  - WhatsApp
  - E-mail Marketing
  - Push Notifications
- Contadores de envios por canal
- Notificações azuis no topo
- Interface para criação de mensagens

### 6. IA e Análises
**Rota**: `/dashboard/ia`

**Funcionalidades**:
- Cards de recursos de IA em desenvolvimento:
  - Análise Preditiva (53%)
  - Segmentação Inteligente (46%)
  - Otimização de Campanhas (57%)
  - Análise de Sentimento (35%)
  - Geração de Conteúdo (65%)
  - Dashboard Preditivo (67%)
- Insights recentes com recomendações
- Barras de progresso animadas
- Badges "Em desenvolvimento"

### 7. Relatórios
**Rota**: `/dashboard/relatorios`

**Funcionalidades**:
- Cards de métricas:
  - Total de Usuários
  - Cadastros este Mês
  - Taxa de Crescimento
  - Campanhas Ativas
- Gráfico de barras: Cadastros por Mês
- Gráfico de pizza: Distribuição por Tipo
- Botão "Exportar CSV"
- Cores roxas nos gráficos

### 8. Configurações
**Rota**: `/dashboard/configuracoes`

**Funcionalidades**:
- Abas:
  - **Permissões e Roles**: Definir acessos por tipo de usuário
  - **Tema**: Configurações visuais
  - **Integrações**: APIs externas
- Checkboxes para permissões:
  - Super Admin pode deletar usuários
  - Admin pode criar campanhas
  - Líder pode visualizar relatórios
  - Pessoa pode convidar outros
- Botão "Salvar Configurações"

## 🎯 Navegação

### Sidebar (Menu Lateral)
**Menu Principal**:
- Dashboard
- Usuários
- Hierarquia
- Campanhas
- Comunicação

**Análises**:
- IA e Análises
- Relatórios
- Configurações

### Header (Cabeçalho)
- Logo da Renata Daguiar
- Título: "Sistema Político"
- Subtítulo: "Campanha Inteligente"
- Busca global
- Toggle de tema (claro/escuro)
- Notificações
- Avatar do usuário
- **Botão Sair** (vermelho)

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15.1.6 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Animações**: Skeletons customizados
- **Gerenciamento de Estado**: LocalStorage (autenticação)

## 📁 Estrutura de Arquivos

```
nextadmin-politico/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── layout.tsx          # Layout sem sidebar/header
│   │   │   └── sign-in/
│   │   │       └── page.tsx        # Página de login
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Layout com sidebar/header
│   │   │   ├── page.tsx            # Dashboard principal
│   │   │   ├── usuarios/
│   │   │   ├── hierarquia/
│   │   │   ├── campanhas/
│   │   │   ├── comunicacao/
│   │   │   ├── ia/
│   │   │   ├── relatorios/
│   │   │   └── configuracoes/
│   │   ├── layout.tsx              # Layout raiz
│   │   └── page.tsx                # Redirecionamento
│   ├── components/
│   │   ├── Auth/
│   │   │   └── LoginPolitico.tsx
│   │   ├── Dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── GrowthChart.tsx
│   │   │   └── Notifications.tsx
│   │   ├── Layouts/
│   │   │   ├── header/
│   │   │   └── sidebar/
│   │   └── logo.tsx
│   ├── middleware.ts               # Proteção de rotas
│   └── css/
│       └── style.css
├── public/
│   └── images/
│       └── logo/
│           └── logo-politico.png
├── tailwind.config.ts              # Cores personalizadas
└── package.json
```

## 🚀 Como Executar

### Instalação
```bash
cd nextadmin-politico
npm install
```

### Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Build de Produção
```bash
npm run build
npm start
```

## 🔄 Fluxo de Uso

1. **Acesso Inicial**
   - Usuário acessa a aplicação
   - É redirecionado para `/auth/sign-in`
   - Vê apenas a tela de login (sem menu)

2. **Login**
   - Preenche email e senha
   - Clica em "Entrar"
   - Vê skeleton de carregamento por 2 segundos
   - É redirecionado para `/dashboard`

3. **Navegação**
   - Sidebar e header aparecem
   - Logo da Renata Daguiar visível
   - Pode navegar entre todos os módulos
   - Cada clique mostra skeleton/contador

4. **Logout**
   - Clica no botão "Sair" (vermelho)
   - Retorna para tela de login
   - Sidebar/header desaparecem

## 🎨 Componentes Visuais

### Skeleton Loaders
- Aparecem em todas as transições
- Animação de pulso suave
- Cores em tons de cinza claro
- Duração: 1-2 segundos

### Contadores de Carregamento
- Formato: "Carregando 1/3..."
- Aparecem em operações assíncronas
- Cores roxas

### Badges de Status
- **Super Admin**: Roxo escuro
- **Admin**: Roxo médio
- **Líder**: Lilás
- **Pessoa**: Cinza
- **Agendada**: Amarelo
- **Concluída**: Verde
- **Enviando**: Azul

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar expandida
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer, layout otimizado

## 🔮 Próximos Passos (Integração Futura)

- [ ] Integração com backend real (API REST ou GraphQL)
- [ ] Autenticação JWT
- [ ] Banco de dados (PostgreSQL/MongoDB)
- [ ] Sistema de permissões real
- [ ] Integração com WhatsApp Business API
- [ ] Integração com serviços de email (SendGrid/Mailgun)
- [ ] IA real para análise preditiva
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Upload de imagens para campanhas
- [ ] Sistema de notificações em tempo real (WebSockets)

## 📄 Licença

Projeto personalizado baseado no template NextAdminHQ.

## 👥 Créditos

- **Template Base**: NextAdminHQ
- **Personalização**: Sistema Político - Campanha Inteligente
- **Logo**: Renata Daguiar
- **Ano**: 2025

---

**Campanha Inteligente © 2025**
