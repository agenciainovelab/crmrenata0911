const { Client } = require('pg');

const connectionString = "postgresql://crm:Leo07102008%40%23%40@31.97.172.127:2/renata?sslmode=require";

async function testConnection() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Conexão com banco de dados bem-sucedida!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Versão do PostgreSQL:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
}

testConnection();
