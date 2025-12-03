const { Client } = require('pg');

async function testTrust() {
  console.log('🔍 Testando conexão sem senha (trust auth)...\n');

  // Listar databases disponíveis
  const databases = ['renata', 'postgres', 'template1'];

  for (const db of databases) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: db,
      user: 'postgres',
    });

    try {
      await client.connect();
      console.log(`✅ Conectado ao database: ${db} (sem senha)`);

      // Verificar se o database renata existe
      if (db === 'postgres') {
        const result = await client.query(`
          SELECT datname FROM pg_database WHERE datname = 'renata'
        `);

        if (result.rows.length > 0) {
          console.log('✅ Database "renata" existe!');
        } else {
          console.log('⚠️  Database "renata" NÃO existe. Precisa ser criado.');
        }
      }

      await client.end();
      return true;
    } catch (error) {
      console.log(`❌ Falha ao conectar em ${db}: ${error.message}`);
    }
  }

  return false;
}

testTrust();
