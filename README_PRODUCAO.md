# 🗳️ Sistema Político - CRM Renata (Versão Produção)

## ✨ Melhorias de Segurança e Produção Implementadas

Esta versão inclui correções críticas de segurança e melhorias para preparar o sistema para produção.

### 🔐 Segurança

- ✅ **Autenticação JWT Real**: Sistema completo de autenticação com tokens JWT
- ✅ **Cookies HttpOnly**: Tokens armazenados de forma segura
- ✅ **Rate Limiting**: Proteção contra ataques de força bruta
- ✅ **Headers de Segurança**: CSP, X-Frame-Options, HSTS, etc.
- ✅ **Middleware de Proteção**: Verificação de autenticação em todas as rotas
- ✅ **Credenciais Protegidas**: Arquivo `.env` removido do Git

### 🚀 Deploy

- ✅ **Configuração Vercel**: Arquivo `vercel.json` para deploy na Vercel
- ✅ **Docker**: Dockerfile e docker-compose.yml completos
- ✅ **Variáveis de Ambiente**: Arquivo `.env.example` documentado
- ✅ **Scripts de Build**: Comandos otimizados para produção

### 📊 Monitoramento

- ✅ **Logging Estruturado**: Sistema de logs com níveis (info, warn, error)
- ✅ **Páginas de Erro**: Error boundaries e página 404 customizada
- ✅ **Performance Tracking**: Medição de performance de operações

### 🧪 Testes

- ✅ **Jest Configurado**: Framework de testes instalado
- ✅ **Testes de API**: Exemplo de testes para API de login
- ✅ **Scripts de Teste**: `npm test`, `npm run test:coverage`

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Configurar banco de dados no .env
# DATABASE_URL="postgresql://user:password@localhost:5432/database"

# 4. Gerar cliente Prisma
npm run prisma:generate

# 5. Executar migrações
npm run prisma:migrate

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

### Produção com Docker

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env.production

# 2. Editar .env.production com credenciais reais

# 3. Iniciar todos os serviços
docker-compose up -d

# 4. Executar migrações
docker-compose exec app npx prisma migrate deploy
```

## 📚 Documentação

- **[DEPLOY.md](DEPLOY.md)**: Guia completo de deploy
- **[SECURITY.md](SECURITY.md)**: Política de segurança
- **[DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)**: Documentação técnica

## 🔒 Checklist de Segurança

Antes de colocar em produção:

- [ ] Configurar `JWT_SECRET` com chave forte
- [ ] Configurar credenciais do banco de dados
- [ ] Ativar HTTPS
- [ ] Configurar backup automático
- [ ] Configurar monitoramento (Sentry, Datadog)
- [ ] Revisar permissões de usuários
- [ ] Testar todas as funcionalidades

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento
npm run build            # Build para produção
npm start                # Iniciar produção
npm test                 # Executar testes
npm run test:coverage    # Cobertura de testes
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Executar migrações
npm run prisma:studio    # Interface visual do banco
```

## 🔄 Mudanças Principais

### Autenticação

**Antes:**
```typescript
// Login simulado, sem segurança
const handleLogin = () => {
  // Qualquer email/senha funcionava
}
```

**Depois:**
```typescript
// Login real com JWT
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, senha })
});
// Retorna tokens JWT em cookies HttpOnly
```

### Proteção de Rotas

**Antes:**
```typescript
// Middleware vazio
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
```

**Depois:**
```typescript
// Middleware com verificação JWT
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return redirect('/auth/sign-in');
  
  const isValid = await verifyToken(token);
  if (!isValid) return redirect('/auth/sign-in');
  
  return NextResponse.next();
}
```

## 🆘 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs
docker-compose logs postgres
```

### Erro de Build

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte a documentação em `DEPLOY.md` e `SECURITY.md`
2. Verifique os logs: `docker-compose logs -f`
3. Entre em contato com a equipe de desenvolvimento

---

**Campanha Inteligente © 2025**

*Sistema preparado para produção com segurança, monitoramento e deploy automatizado.*
