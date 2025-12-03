const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testando conexão com o banco de dados...');

    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados bem-sucedida!');

    // Contar usuários
    const userCount = await prisma.usuario.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

    // Listar primeiro usuário (se existir)
    if (userCount > 0) {
      const firstUser = await prisma.usuario.findFirst({
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
        }
      });
      console.log('👤 Primeiro usuário encontrado:', firstUser);
    } else {
      console.log('⚠️  Nenhum usuário encontrado no banco de dados.');
      console.log('💡 Execute: npm run seed ou crie um usuário manualmente.');
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
