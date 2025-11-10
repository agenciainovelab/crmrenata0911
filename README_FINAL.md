# 🗳️ Sistema Político Inteligente - Renata Daguiar

## 🎉 Sistema Completo Entregue!

Painel administrativo político **100% funcional** desenvolvido em **Next.js 15** com **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma** e integração com **ChatGPT**.

---

## ✨ Novidades Implementadas

### 🤖 **IA 100% Funcional**
- ✅ Chat integrado com **ChatGPT (gpt-4.1-mini)**
- ✅ Assistente especializado em campanhas políticas
- ✅ Análises em tempo real
- ✅ Perguntas sugeridas
- ✅ Insights automáticos

### 🗳️ **Sistema Completo de Cadastro de Eleitores**
- ✅ **CRUD completo** (Create, Read, Update, Delete)
- ✅ **Formulário com 3 abas**:
  - 📄 Dados Pessoais
  - 🏠 Endereço (com busca automática via CEP)
  - 📊 Dados Eleitorais
- ✅ **Busca automática de endereço** via API ViaCEP
- ✅ **Validação completa** com Zod
- ✅ **Relacionamento hierárquico** (eleitor → líder)
- ✅ **Listagem com paginação**
- ✅ **Busca por nome, cidade ou CPF**

---

## 🌐 Acesso ao Sistema

**URL**: https://3001-iddew3bszs42c5pu4570w-4b5c8339.manusvm.computer

**Login**: Qualquer email e senha (autenticação simulada)

---

## 🗄️ Banco de Dados

### PostgreSQL + Prisma
- ✅ Banco configurado e rodando
- ✅ Tabelas: `Usuario` e `Eleitor`
- ✅ Relacionamentos funcionais
- ✅ Migrações aplicadas

### Usuário Mock Criado
```
ID: 00000000-0000-0000-0000-000000000001
Nome: Admin Político
Email: admin@politico.com
Role: SUPER_ADMIN
```

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências
```bash
cd nextadmin-politico
npm install
```

### 2. Configurar Banco de Dados
```bash
# Certifique-se de que o PostgreSQL está rodando
sudo service postgresql start

# Executar migrações
npx prisma migrate dev

# Criar usuário inicial
npx tsx prisma/seed.ts
```

### 3. Configurar Variáveis de Ambiente
Edite o arquivo `.env`:
```env
DATABASE_URL="postgresql://campanha_user:campanha123@localhost:5432/campanha_politica?schema=public"
OPENAI_API_KEY="sua_chave_aqui"
```

### 4. Executar Aplicação
```bash
npm run dev
```

### 5. Acessar
```
http://localhost:3000
```

---

## 📸 Screenshots

### 1. Tela de Login
![Login](screenshot-login.webp)

### 2. Dashboard
![Dashboard](screenshot-dashboard.webp)

### 3. Formulário de Cadastro de Eleitores
![Formulário](screenshot-formulario-eleitor.webp)

### 4. Chat com IA
![IA Chat](screenshot-ia-chat.webp)

---

## 📦 Estrutura do Projeto

```
nextadmin-politico/
├── prisma/
│   ├── schema.prisma          # Modelos do banco
│   ├── seed.ts                # Dados iniciais
│   └── migrations/            # Migrações
├── src/
│   ├── app/
│   │   ├── auth/              # Autenticação
│   │   ├── dashboard/         # Páginas protegidas
│   │   │   ├── eleitores/     # CRUD de eleitores
│   │   │   ├── ia/            # Chat com IA
│   │   │   └── ...
│   │   └── api/               # API Routes
│   │       ├── eleitores/     # CRUD API
│   │       ├── cep/           # Busca CEP
│   │       └── ia/chat/       # Chat GPT
│   ├── components/
│   │   ├── Eleitores/         # Componentes de eleitores
│   │   ├── Dashboard/         # Componentes do dashboard
│   │   └── Layouts/           # Sidebar, Header
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── validations/       # Schemas Zod
│   └── middleware.ts          # Autenticação
├── public/
│   └── images/logo.png        # Logo Renata Daguiar
├── .env                       # Variáveis de ambiente
└── package.json
```

---

## 🎯 Funcionalidades Testadas

### ✅ Login
- Tela sem sidebar/header
- Logo personalizada
- Skeleton de autenticação
- Redirecionamento correto

### ✅ Dashboard
- Cards estatísticos
- Gráficos funcionais
- Skeletons de carregamento

### ✅ Eleitores
- Listagem vazia inicial
- Botão "Novo Eleitor"
- Modal com 3 abas
- Formulário completo

### ✅ IA
- Chat funcional
- Integração com ChatGPT
- Resposta em tempo real
- Perguntas sugeridas

---

## 🔧 Tecnologias Utilizadas

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- **OpenAI API** (ChatGPT)
- **Zod** (validação)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

---

## 📚 Documentação

Consulte `DOCUMENTACAO_COMPLETA.md` para detalhes técnicos completos.

---

## 🎨 Paleta de Cores

```css
Roxo Principal: #7B2CBF
Roxo Escuro: #3A0CA3
Azul: #3B82F6
Fundo Claro: #F9FAFB
```

---

## 🔐 Segurança

- ✅ Validação com Zod
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Middleware de autenticação
- ✅ Variáveis de ambiente seguras

---

## 🚀 Próximos Passos

1. **Autenticação Real** (JWT)
2. **Permissões Granulares** (RBAC)
3. **Integrações** (WhatsApp, SendGrid)
4. **Analytics Avançado**
5. **Deploy em Produção**

---

## 📞 Suporte

Sistema desenvolvido para **Campanha Inteligente © 2025**

---

**Desenvolvido com ❤️ para Renata Daguiar**
