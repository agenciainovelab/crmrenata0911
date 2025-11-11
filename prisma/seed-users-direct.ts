import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Conectar diretamente sem usar .env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://crm:Leo07102008%40%23%40@31.97.172.127:5432/renata?schema=public'
    }
  }
});

async function main() {
  console.log('🌱 Iniciando seed de usuários...');

  // Senha padrão para todos: 123456
  const senhaHash = await bcrypt.hash('123456', 10);

  // 1. Super Admin - Leonardo Barros
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'leo@inovelab.app' },
    update: {
      nome: 'Leonardo Barros',
      senhaHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      nome: 'Leonardo Barros',
      email: 'leo@inovelab.app',
      senhaHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin criado:', superAdmin.email);

  // 2. Admin - Renata Daguiar
  const adminRenata = await prisma.usuario.upsert({
    where: { email: 'renata@renatadaguiar.com' },
    update: {
      nome: 'Renata Daguiar',
      senhaHash,
      role: 'ADMIN',
    },
    create: {
      nome: 'Renata Daguiar',
      email: 'renata@renatadaguiar.com',
      senhaHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', adminRenata.email);

  // 3. Admin - Letícia
  const adminLeticia = await prisma.usuario.upsert({
    where: { email: 'leticia@renatadaguiar.com' },
    update: {
      nome: 'Letícia',
      senhaHash,
      role: 'ADMIN',
    },
    create: {
      nome: 'Letícia',
      email: 'leticia@renatadaguiar.com',
      senhaHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', adminLeticia.email);

  // 4. Líder Geral - João
  const liderJoao = await prisma.usuario.upsert({
    where: { email: 'joao@renatadaguiar.com' },
    update: {
      nome: 'João',
      senhaHash,
      role: 'LIDER',
    },
    create: {
      nome: 'João',
      email: 'joao@renatadaguiar.com',
      senhaHash,
      role: 'LIDER',
    },
  });
  console.log('✅ Líder Geral criado:', liderJoao.email);

  console.log('\n🎉 Seed de usuários concluído com sucesso!');
  console.log('\n📋 Usuários criados:');
  console.log('   • Super Admin: leo@inovelab.app (senha: 123456)');
  console.log('   • Admin: renata@renatadaguiar.com (senha: 123456)');
  console.log('   • Admin: leticia@renatadaguiar.com (senha: 123456)');
  console.log('   • Líder Geral: joao@renatadaguiar.com (senha: 123456)');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
