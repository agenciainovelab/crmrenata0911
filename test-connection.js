const { Client } = require('pg');

async function testPostgres() {
  const client = new Client({
    host: '31.97.172.127',
    port: 2,
    user: 'crm',
    password: 'Leo07102008@#@',
    database: 'renata',
  });

  try {
    console.log('🔗 Testando conexão PostgreSQL...');
    await client.connect();
    console.log('✅ PostgreSQL conectado com sucesso!');

    const result = await client.query('SELECT NOW()');
    console.log('📅 Data/hora do servidor:', result.rows[0].now);

    // Verificar se a tabela usuarios existe
    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'usuarios'
    `);

    if (tables.rows.length > 0) {
      console.log('✅ Tabela "usuarios" encontrada');

      // Contar usuários
      const count = await client.query('SELECT COUNT(*) FROM usuarios');
      console.log(`📊 Total de usuários: ${count.rows[0].count}`);
    } else {
      console.log('⚠️ Tabela "usuarios" não encontrada');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  }
}

async function testRedis() {
  const Redis = require('ioredis');

  const redis = new Redis({
    host: '31.97.172.127',
    port: 3,
    password: 'Leo07102008@#@',
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
  });

  try {
    console.log('\n🔗 Testando conexão Redis...');
    await redis.ping();
    console.log('✅ Redis conectado com sucesso!');
    await redis.quit();
  } catch (error) {
    console.error('❌ Erro ao conectar Redis:', error.message);
  }
}

testPostgres().then(() => testRedis());
