const { Client } = require('pg');

const client = new Client({
  host: '31.97.172.127',
  port: 2,
  user: 'crm',
  password: 'Leo07102008@#@',
  database: 'renata',
});

async function addTelefoneField() {
  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Add telefone field to usuarios table
    await client.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;
    `);

    console.log('Campo telefone adicionado com sucesso!');

    await client.end();
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

addTelefoneField();
