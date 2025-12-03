const { Client } = require('pg');

async function testExactCredentials() {
  console.log('🔍 Testando com credenciais exatas da imagem...\n');

  const config = {
    host: 'localhost',
    port: 5432,
    database: 'renata',
    user: 'crm',
    password: 'Leo07102008@#@',
  };

  console.log('Configuração:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${config.password}\n`);

  const client = new Client(config);

  try {
    console.log('Tentando conectar...');
    await client.connect();
    console.log('✅ CONEXÃO BEM-SUCEDIDA!\n');

    // Testar query
    const result = await client.query('SELECT current_database(), current_user');
    console.log('📊 Informações do banco:');
    console.log(`  Database atual: ${result.rows[0].current_database}`);
    console.log(`  Usuário atual: ${result.rows[0].current_user}\n`);

    // Contar tabelas
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`📋 Tabelas encontradas: ${tables.rows.length}`);
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('\nDetalhes técnicos:');
    console.error(error);
    return false;
  }
}

testExactCredentials();
