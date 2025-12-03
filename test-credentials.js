const { Client } = require('pg');

const credentials = [
  { user: 'postgres', password: 'postgres', description: 'postgres/postgres' },
  { user: 'postgres', password: '', description: 'postgres/sem senha' },
  { user: 'postgres', password: 'admin', description: 'postgres/admin' },
  { user: 'postgres', password: 'root', description: 'postgres/root' },
  { user: 'crm', password: 'Leo07102008@#@', description: 'crm/Leo07102008@#@' },
];

async function testCredential(cred) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'renata',
    user: cred.user,
    password: cred.password,
  });

  try {
    await client.connect();
    console.log(`✅ SUCESSO: ${cred.description}`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ FALHOU: ${cred.description} - ${error.message}`);
    return false;
  }
}

async function findCredentials() {
  console.log('🔍 Testando credenciais do PostgreSQL...\n');

  for (const cred of credentials) {
    const success = await testCredential(cred);
    if (success) {
      console.log('\n🎉 Credenciais corretas encontradas!');
      console.log(`   Usuário: ${cred.user}`);
      console.log(`   Senha: ${cred.password || '(vazia)'}`);
      return;
    }
  }

  console.log('\n❌ Nenhuma credencial funcionou.');
  console.log('💡 Tente resetar a senha do PostgreSQL ou criar um novo usuário.');
}

findCredentials();
