# 🚀 Guia de Deploy - CRM Renata

Este documento descreve como fazer o deploy do sistema CRM Renata em diferentes ambientes de produção.

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- [ ] Banco de dados PostgreSQL configurado e acessível
- [ ] Redis configurado (opcional, mas recomendado)
- [ ] Chave da API OpenAI (para funcionalidade de IA)
- [ ] Chave JWT secreta gerada
- [ ] Domínio configurado (para produção)

## 🔐 Variáveis de Ambiente

Copie o arquivo `.env.example` e configure todas as variáveis necessárias:

```bash
cp .env.example .env
```

### Variáveis Obrigatórias

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
OPENAI_API_KEY="sk-..."
NODE_ENV="production"
```

### Gerar JWT Secret

```bash
openssl rand -base64 32
```

## 🌐 Deploy na Vercel (Recomendado)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Fazer Login

```bash
vercel login
```

### 3. Configurar Variáveis de Ambiente

No painel da Vercel, vá em **Settings > Environment Variables** e adicione:

- `DATABASE_URL`
- `REDIS_URL` (opcional)
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

### 4. Deploy

```bash
vercel --prod
```

### 5. Executar Migrações

Após o deploy, execute as migrações do Prisma:

```bash
npx prisma migrate deploy
```

## 🐳 Deploy com Docker

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.production`:

```env
POSTGRES_USER=crmuser
POSTGRES_PASSWORD=senha-segura-aqui
POSTGRES_DB=crmrenata
REDIS_PASSWORD=senha-redis-aqui
OPENAI_API_KEY=sk-...
JWT_SECRET=sua-chave-jwt-aqui
APP_URL=https://seu-dominio.com
```

### 2. Build e Iniciar

```bash
docker-compose up -d
```

### 3. Executar Migrações

```bash
docker-compose exec app npx prisma migrate deploy
```

### 4. Criar Usuário Inicial

```bash
docker-compose exec app npx tsx prisma/seed.ts
```

## 🔧 Deploy Manual (VPS/Servidor)

### 1. Instalar Dependências do Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql redis-server
```

### 2. Clonar Repositório

```bash
git clone https://github.com/agenciainovelab/crmrenata0911.git
cd crmrenata0911
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Banco de Dados

```bash
# Criar banco de dados
sudo -u postgres createdb crmrenata
sudo -u postgres createuser crmuser -P

# Executar migrações
npx prisma migrate deploy

# Criar usuário inicial
npx tsx prisma/seed.ts
```

### 5. Build da Aplicação

```bash
npm run build
```

### 6. Iniciar com PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "crm-renata" -- start

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

### 7. Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Configurar HTTPS

### Com Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Monitoramento

### Logs

```bash
# Docker
docker-compose logs -f app

# PM2
pm2 logs crm-renata
```

### Health Check

Acesse: `https://seu-dominio.com/api/health`

## 🔄 Atualização

### Vercel

```bash
git push origin main
# Deploy automático
```

### Docker

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Manual

```bash
git pull
npm install
npm run build
pm2 restart crm-renata
```

## ⚠️ Checklist de Segurança

Antes de colocar em produção, verifique:

- [ ] `.env` não está no Git
- [ ] JWT_SECRET é uma chave forte e única
- [ ] Senhas do banco de dados são fortes
- [ ] HTTPS está configurado
- [ ] Firewall está configurado corretamente
- [ ] Backup automático está configurado
- [ ] Monitoramento está ativo

## 🆘 Troubleshooting

### Erro de Conexão com Banco de Dados

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U crmuser -d crmrenata
```

### Erro de Build

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Erro de Prisma

```bash
# Regenerar cliente
npx prisma generate

# Verificar status das migrações
npx prisma migrate status
```

## 📞 Suporte

Para problemas ou dúvidas sobre o deploy, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

---

**Campanha Inteligente © 2025**
