const { Client } = require('pg');

const connectionString = "postgres://crm:Leo07102008%40%23%40@31.97.172.127:2/renata?sslmode=disable";

async function testConnection() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔄 Testando conexão com o banco de dados...');
    await client.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL:', result.rows[0].version.substring(0, 50) + '...');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tabelas encontradas:', tables.rows.length);
    
    await client.end();
    console.log('✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testConnection();
