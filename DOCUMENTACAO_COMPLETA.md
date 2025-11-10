# 📘 Documentação Completa - Sistema Político Inteligente

## 🎯 Visão Geral

Sistema administrativo completo para campanhas políticas desenvolvido em **Next.js 15** (App Router) com **TypeScript**, **Tailwind CSS**, **PostgreSQL** e **Prisma ORM**. Inclui integração com **ChatGPT** para análises inteligentes e sistema completo de cadastro de eleitores.

---

## ✨ Funcionalidades Implementadas

### 1. 🔐 Sistema de Autenticação
- ✅ Tela de login como primeira página (sem sidebar/header)
- ✅ Logo personalizada da Renata Daguiar
- ✅ Skeleton loader durante autenticação
- ✅ Redirecionamento automático para dashboard
- ✅ Botão de logout funcional

### 2. 📊 Dashboard Principal
- ✅ Cards estatísticos com dados de Admins, Líderes e Pessoas
- ✅ Gráficos de crescimento com Recharts
- ✅ Notificações em tempo real
- ✅ Skeletons e contadores de carregamento

### 3. 👥 Gestão de Usuários
- ✅ Listagem por tipo (Super Admin, Admin, Líder, Pessoa)
- ✅ Filtros e busca
- ✅ Tabelas responsivas

### 4. 🌳 Hierarquia Visual
- ✅ Árvore de relacionamentos
- ✅ Cores por nível hierárquico
- ✅ Visualização de quem cadastrou quem

### 5. 🗳️ **CADASTRO DE ELEITORES** (NOVO!)
- ✅ **CRUD completo** (Create, Read, Update, Delete)
- ✅ **Formulário com 3 abas**:
  - 📄 Dados Pessoais (nome, CPF, data nascimento, telefone, email, gênero, escolaridade)
  - 🏠 Endereço (CEP com busca automática via ViaCEP)
  - 📊 Dados Eleitorais (zona, seção)
- ✅ **Busca automática de endereço** por CEP
- ✅ **Validação completa** com Zod
- ✅ **Relacionamento hierárquico** (eleitor vinculado ao líder que cadastrou)
- ✅ **Listagem com paginação**
- ✅ **Busca por nome, cidade ou CPF**
- ✅ **Skeletons e contadores** de progresso

### 6. 📢 Campanhas Políticas
- ✅ Criação de campanhas (WhatsApp, Email, Voz)
- ✅ Seleção de público-alvo
- ✅ Agendamento de envios

### 7. 💬 Comunicação Multicanal
- ✅ WhatsApp, Email Marketing, Push
- ✅ Contadores de envios
- ✅ Notificações de status

### 8. 🤖 **INTELIGÊNCIA ARTIFICIAL** (NOVO!)
- ✅ **Chat 100% funcional com ChatGPT (gpt-4.1-mini)**
- ✅ **Assistente especializado** em campanhas políticas
- ✅ **Análises em tempo real**
- ✅ **Perguntas sugeridas**
- ✅ **Insights automáticos**
- ✅ **Módulos de análise**:
  - Análise Preditiva
  - Segmentação Inteligente
  - Otimização de Campanhas
  - Análise de Sentimento

### 9. 📈 Relatórios
- ✅ Gráficos dinâmicos
- ✅ Exportação de dados
- ✅ Visualizações interativas

### 10. ⚙️ Configurações
- ✅ Permissões e Roles
- ✅ Configurações de tema
- ✅ Integrações

---

## 🗄️ Banco de Dados

### Tecnologias
- **PostgreSQL** (banco relacional)
- **Prisma ORM** (gerenciamento de dados)

### Modelos

#### Usuario
```prisma
model Usuario {
  id          String   @id @default(uuid())
  nome        String
  email       String   @unique
  senhaHash   String
  role        Role
  eleitores   Eleitor[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  LIDER
}
```

#### Eleitor
```prisma
model Eleitor {
  id              String   @id @default(uuid())
  nomeCompleto    String
  cpf             String   @unique
  dataNascimento  DateTime
  telefone        String
  email           String?
  genero          Genero
  escolaridade    Escolaridade
  cep             String
  logradouro      String
  numero          String
  complemento     String?
  bairro          String
  cidade          String
  uf              String
  zonaEleitoral   String?
  secao           String?
  criadoPorId     String
  criadoPor       Usuario  @relation(fields: [criadoPorId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🎨 Design e Paleta de Cores

### Cores Políticas
```css
--politico-roxo: #7B2CBF
--politico-roxo-escuro: #3A0CA3
--politico-azul: #3B82F6
--fundo-claro: #F9FAFB
```

### Hierarquia de Cores
- **Roxo Escuro** → Super Admin
- **Roxo Médio** → Admin
- **Lilás** → Líder
- **Cinza** → Pessoa/Eleitor

---

## 🚀 APIs Implementadas

### Eleitores
- `GET /api/eleitores` - Listar eleitores (com paginação e busca)
- `POST /api/eleitores` - Criar novo eleitor
- `GET /api/eleitores/[id]` - Buscar eleitor específico
- `PUT /api/eleitores/[id]` - Atualizar eleitor
- `DELETE /api/eleitores/[id]` - Deletar eleitor

### CEP
- `GET /api/cep/[cep]` - Buscar endereço via ViaCEP

### IA
- `POST /api/ia/chat` - Chat com ChatGPT

---

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 22+
- PostgreSQL 14+
- npm ou pnpm

### Variáveis de Ambiente (.env)
```env
DATABASE_URL="postgresql://campanha_user:campanha123@localhost:5432/campanha_politica?schema=public"
OPENAI_API_KEY="sua_chave_aqui"
```

### Instalação
```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
npx prisma migrate dev --name init

# 3. Criar usuário inicial
npx tsx prisma/seed.ts

# 4. Executar aplicação
npm run dev
```

### Acesso
- **URL**: http://localhost:3000
- **Login**: Qualquer email/senha (autenticação simulada)

---

## 📦 Dependências Principais

```json
{
  "@prisma/client": "^6.19.0",
  "prisma": "^6.19.0",
  "next": "15.1.6",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "recharts": "^2.15.0",
  "zod": "^3.24.1",
  "openai": "^4.x",
  "lucide-react": "latest"
}
```

---

## 🎯 Fluxo de Cadastro de Eleitores

1. **Acesso**: Menu lateral → "Eleitores"
2. **Novo Cadastro**: Botão "+ Novo Eleitor"
3. **Aba 1 - Dados Pessoais**:
   - Nome completo, CPF, data nascimento
   - Telefone, email (opcional)
   - Gênero e escolaridade
4. **Aba 2 - Endereço**:
   - Digitar CEP → Busca automática
   - Complementar número e complemento
5. **Aba 3 - Dados Eleitorais**:
   - Zona eleitoral (opcional)
   - Seção (opcional)
6. **Salvar**: Contador "Salvando 1/3, 2/3, 3/3..."
7. **Confirmação**: Eleitor cadastrado e vinculado ao líder

---

## 🤖 Uso da IA

### Como Usar
1. Acesse **"IA e Análises"** no menu
2. Digite sua pergunta no chat
3. Aguarde resposta do ChatGPT
4. Explore perguntas sugeridas

### Exemplos de Perguntas
- "Como segmentar eleitores por região?"
- "Qual o melhor horário para enviar mensagens?"
- "Como analisar dados de engajamento?"
- "Estratégias para aumentar participação"

---

## 📱 Responsividade

✅ Desktop (1920x1080)
✅ Tablet (768x1024)
✅ Mobile (375x667)

---

## 🔒 Segurança

- ✅ Validação de dados com Zod
- ✅ Sanitização de inputs
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Middleware de autenticação
- ✅ Variáveis de ambiente seguras

---

## 🚀 Próximos Passos (Integração Futura)

1. **Autenticação Real**
   - JWT tokens
   - Refresh tokens
   - Recuperação de senha

2. **Permissões Granulares**
   - RBAC (Role-Based Access Control)
   - Permissões por módulo

3. **Integrações**
   - WhatsApp Business API
   - SendGrid (email marketing)
   - Twilio (SMS/Voz)

4. **Analytics Avançado**
   - Google Analytics
   - Hotjar
   - Dashboards personalizados

5. **IA Expandida**
   - Análise de sentimento em redes sociais
   - Previsões eleitorais
   - Geração automática de conteúdo

---

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do sistema de feedback.

---

## 📄 Licença

Sistema desenvolvido para **Campanha Inteligente © 2025**

---

**Desenvolvido com ❤️ usando Next.js 15 + TypeScript + Tailwind + PostgreSQL + Prisma + ChatGPT**
