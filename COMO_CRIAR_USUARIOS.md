# Como Criar os Usuários do Sistema

## ⚠️ Importante
O banco de dados PostgreSQL precisa estar online e acessível em `31.97.172.127:5432` para executar este script.

## 📋 Usuários que serão criados

| Nome | Email | Senha | Role |
|------|-------|-------|------|
| Leonardo Barros | leo@inovelab.app | 123456 | SUPER_ADMIN |
| Renata Daguiar | renata@renatadaguiar.com | 123456 | ADMIN |
| Letícia | leticia@renatadaguiar.com | 123456 | ADMIN |
| João | joao@renatadaguiar.com | 123456 | LIDER |

## 🚀 Como Executar

### Método 1: Script Node.js (Recomendado)

```bash
node create-users-pg.js
```

Este script:
- ✅ Conecta diretamente no PostgreSQL sem usar Prisma
- ✅ Gera hash bcrypt da senha "123456"
- ✅ Cria ou atualiza os usuários (ON CONFLICT DO UPDATE)
- ✅ Não tem problema com variáveis de ambiente circulares

### Método 2: SQL Direto

Se preferir executar manualmente via psql ou outro cliente PostgreSQL:

```bash
PGPASSWORD="Leo07102008@#@" psql -h 31.97.172.127 -p 5432 -U crm -d renata -f create-users.sql
```

Ou copie e cole o conteúdo do arquivo `create-users.sql` em qualquer cliente PostgreSQL.

## 🔑 Permissões por Role

### SUPER_ADMIN (Leonardo Barros)
- ✅ Acesso total ao sistema
- ✅ Configurar IA e códigos
- ✅ Gerenciar todos os usuários
- ✅ Todas as permissões

### ADMIN (Renata e Letícia)
- ✅ Cadastrar eleitores
- ✅ Cadastrar líderes
- ✅ Marcar reuniões
- ✅ Responder helpdesk
- ❌ NÃO pode editar códigos ou configurações de IA

### LIDER (João - Líder Geral)
- ✅ Cadastrar eleitores em seu grupo
- ✅ Marcar reuniões
- ✅ Responder helpdesk
- ❌ Não pode gerenciar outros líderes

### PESSOA (Usuário comum)
- Ver o que Renata já fez (se o grupo dele permitir)
- Ver notícias sobre ela
- Acessar redes sociais
- Sistema de atendimento exclusivo
- Ver mapa/local da reunião se o grupo estiver marcado

## 🐛 Problemas Conhecidos

### Erro: "Maximum call stack size exceeded"
Este erro ocorre quando há variáveis de ambiente circulares no arquivo `.env`.

**Solução aplicada:**
- O arquivo `.env` foi limpo e não possui mais referências circulares
- Use o script `create-users-pg.js` que não depende do Prisma Client

### Erro: "Can't reach database server"
O banco de dados PostgreSQL não está acessível.

**Verifique:**
1. O servidor VPS está online?
2. A porta 5432 está aberta no firewall?
3. O PostgreSQL está rodando?
4. As credenciais estão corretas?

```bash
# Testar conexão
telnet 31.97.172.127 5432
```

## 📦 Dependências Instaladas

```json
{
  "bcrypt": "^5.1.1",
  "@types/bcrypt": "^5.0.2",
  "pg": "^8.11.3"
}
```

## 🔄 Próximos Passos

Após criar os usuários, você precisará:

1. ✅ Implementar autenticação real (atualmente é apenas localStorage)
2. ✅ Adicionar middleware de autorização nas rotas da API
3. ✅ Implementar role-based access control (RBAC)
4. ✅ Criar sistema de login com verificação de senha bcrypt
5. ✅ Adicionar tokens JWT ou sessões seguras

## 📝 Notas

- Todas as senhas são "123456" (hash bcrypt)
- Os usuários são criados com `ON CONFLICT DO UPDATE`, então é seguro executar múltiplas vezes
- O script `create-users-pg.js` não usa variáveis de ambiente, conecta diretamente
