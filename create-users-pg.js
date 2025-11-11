const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: '31.97.172.127',
  port: 2,
  user: 'crm',
  password: 'Leo07102008@#@',
  database: 'renata',
});

async function main() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!');

    // Senha padrão para todos: 123456
    const senhaHash = await bcrypt.hash('123456', 10);
    console.log('\n🔐 Hash da senha gerado:', senhaHash);

    const users = [
      { nome: 'Leonardo Barros', email: 'leo@inovelab.app', role: 'SUPER_ADMIN' },
      { nome: 'Renata Daguiar', email: 'renata@renatadaguiar.com', role: 'ADMIN' },
      { nome: 'Letícia', email: 'leticia@renatadaguiar.com', role: 'ADMIN' },
      { nome: 'João', email: 'joao@renatadaguiar.com', role: 'LIDER' },
    ];

    console.log('\n🌱 Criando usuários...\n');

    for (const user of users) {
      const query = `
        INSERT INTO usuarios (id, nome, email, "senhaHash", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          nome = EXCLUDED.nome,
          "senhaHash" = EXCLUDED."senhaHash",
          role = EXCLUDED.role,
          "updatedAt" = NOW()
        RETURNING email, role;
      `;

      const result = await client.query(query, [user.nome, user.email, senhaHash, user.role]);
      console.log(`✅ ${user.role.padEnd(12)} - ${result.rows[0].email}`);
    }

    console.log('\n🎉 Usuários criados com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log('   • leo@inovelab.app (senha: 123456)');
    console.log('   • renata@renatadaguiar.com (senha: 123456)');
    console.log('   • leticia@renatadaguiar.com (senha: 123456)');
    console.log('   • joao@renatadaguiar.com (senha: 123456)');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
