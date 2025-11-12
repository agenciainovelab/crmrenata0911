# 🔒 Política de Segurança - CRM Renata

## 🎯 Visão Geral

Este documento descreve as práticas de segurança implementadas no sistema CRM Renata e as recomendações para manter o sistema seguro em produção.

## ✅ Medidas de Segurança Implementadas

### 1. Autenticação e Autorização

- **JWT (JSON Web Tokens)**: Sistema de autenticação baseado em tokens com expiração
- **Cookies HttpOnly**: Tokens armazenados em cookies seguros, inacessíveis via JavaScript
- **Refresh Tokens**: Sistema de renovação de tokens para sessões longas
- **Middleware de Proteção**: Verificação de autenticação em todas as rotas protegidas
- **Rate Limiting**: Proteção contra ataques de força bruta (5 tentativas a cada 15 minutos)

### 2. Proteção de Dados

- **Bcrypt**: Hash de senhas com salt automático
- **Validação de Entrada**: Zod para validação de todos os dados de entrada
- **Sanitização**: Proteção contra SQL Injection via Prisma ORM
- **Variáveis de Ambiente**: Credenciais armazenadas fora do código-fonte

### 3. Headers de Segurança

Os seguintes headers HTTP estão configurados:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 4. Proteção contra Ataques Comuns

- **XSS (Cross-Site Scripting)**: React escapa automaticamente o conteúdo
- **CSRF (Cross-Site Request Forgery)**: Cookies SameSite=Lax
- **SQL Injection**: Prisma ORM com queries parametrizadas
- **Clickjacking**: Header X-Frame-Options

## 🔐 Boas Práticas Recomendadas

### Gerenciamento de Senhas

1. **Nunca** armazene senhas em texto plano
2. Use senhas fortes (mínimo 12 caracteres, letras, números e símbolos)
3. Implemente política de expiração de senhas
4. Adicione autenticação de dois fatores (2FA) - **TODO**

### Variáveis de Ambiente

```bash
# ❌ NUNCA faça isso
git add .env

# ✅ Sempre use
git add .env.example
```

**Variáveis sensíveis que NUNCA devem estar no Git:**
- `DATABASE_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `REDIS_PASSWORD`

### Atualizações de Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente
npm audit fix

# Atualizar dependências
npm update
```

## 🚨 Checklist de Segurança para Produção

Antes de colocar o sistema em produção, verifique:

### Infraestrutura
- [ ] HTTPS configurado com certificado válido
- [ ] Firewall configurado (apenas portas 80/443 abertas)
- [ ] Banco de dados não acessível publicamente
- [ ] Redis protegido com senha
- [ ] Backups automáticos configurados

### Aplicação
- [ ] `.env` não está no repositório Git
- [ ] `JWT_SECRET` é uma chave forte e única
- [ ] `NODE_ENV=production` está configurado
- [ ] Logs de erro não expõem informações sensíveis
- [ ] Rate limiting está ativo
- [ ] Headers de segurança estão configurados

### Monitoramento
- [ ] Sistema de logging centralizado (Sentry, Datadog)
- [ ] Alertas de erros configurados
- [ ] Monitoramento de performance (APM)
- [ ] Logs de auditoria para ações críticas

## 🔍 Auditoria e Logging

### Eventos que Devem Ser Logados

1. **Autenticação**
   - Login bem-sucedido
   - Tentativas de login falhadas
   - Logout
   - Alteração de senha

2. **Ações Críticas**
   - Criação/edição/exclusão de usuários
   - Criação/edição/exclusão de eleitores
   - Mudanças de permissões
   - Exportação de dados

3. **Erros de Segurança**
   - Tentativas de acesso não autorizado
   - Tokens inválidos ou expirados
   - Rate limiting ativado

### Exemplo de Log de Auditoria

```typescript
logger.audit('USUARIO_CRIADO', userId, {
  targetUserId: newUser.id,
  role: newUser.role,
  ip: request.ip,
});
```

## 🛡️ Resposta a Incidentes

### Em Caso de Violação de Segurança

1. **Contenção Imediata**
   - Desative o acesso afetado
   - Revogue todos os tokens JWT
   - Mude todas as senhas e chaves

2. **Investigação**
   - Analise os logs de auditoria
   - Identifique o escopo do incidente
   - Documente todas as descobertas

3. **Recuperação**
   - Corrija a vulnerabilidade
   - Restaure dados de backup se necessário
   - Notifique usuários afetados

4. **Pós-Incidente**
   - Atualize políticas de segurança
   - Implemente medidas preventivas
   - Treine a equipe

## 📊 Monitoramento de Segurança

### Métricas Importantes

- Taxa de tentativas de login falhadas
- Tempo de resposta das APIs
- Erros 401/403 (não autorizados)
- Uso de recursos (CPU, memória, disco)

### Ferramentas Recomendadas

- **Sentry**: Monitoramento de erros
- **Datadog**: APM e logs
- **Cloudflare**: WAF e proteção DDoS
- **Snyk**: Análise de vulnerabilidades

## 🔄 Atualizações de Segurança

### Cronograma Recomendado

- **Diário**: Verificar logs de segurança
- **Semanal**: Executar `npm audit`
- **Mensal**: Atualizar dependências
- **Trimestral**: Revisão completa de segurança

## 📞 Reportar Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: security@example.com
3. Inclua detalhes da vulnerabilidade
4. Aguarde resposta antes de divulgar

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

---

**Última atualização**: 2025-11-11

**Campanha Inteligente © 2025**
