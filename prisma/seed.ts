import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário mock para testes
  const user = await prisma.usuario.upsert({
    where: { email: 'admin@politico.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Admin Político',
      email: 'admin@politico.com',
      senhaHash: 'mock_hash',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Usuário criado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
