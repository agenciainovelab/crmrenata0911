import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco com dados de hierarquia...');

  // Limpar dados existentes (exceto o admin principal)
  await prisma.eleitor.deleteMany({});
  
  // Buscar o usuário admin existente
  let adminPrincipal = await prisma.usuario.findFirst({
    where: { email: 'admin@politico.com' },
  });

  if (!adminPrincipal) {
    // Criar admin principal se não existir
    const senhaHash = 'senha123'; // Mock hash
    adminPrincipal = await prisma.usuario.create({
      data: {
        nome: 'Admin Político',
        email: 'admin@politico.com',
        senhaHash,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Super Admin criado');
  }

  // Criar 3 eleitores para o admin principal
  const eleitores1 = await prisma.eleitor.createMany({
    data: [
      {
        nomeCompleto: 'João Silva Santos',
        cpf: '12345678901',
        dataNascimento: new Date('1985-03-15'),
        telefone: '(11) 98765-4321',
        email: 'joao.silva@email.com',
        genero: 'Masculino',
        escolaridade: 'Superior Completo',
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        zonaEleitoral: '001',
        secao: '0123',
        criadoPorId: adminPrincipal.id,
      },
      {
        nomeCompleto: 'Maria Oliveira Costa',
        cpf: '23456789012',
        dataNascimento: new Date('1990-07-22'),
        telefone: '(11) 97654-3210',
        email: 'maria.oliveira@email.com',
        genero: 'Feminino',
        escolaridade: 'Superior Completo',
        cep: '01310-200',
        logradouro: 'Avenida Paulista',
        numero: '2000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        zonaEleitoral: '001',
        secao: '0124',
        criadoPorId: adminPrincipal.id,
      },
      {
        nomeCompleto: 'Pedro Henrique Alves',
        cpf: '34567890123',
        dataNascimento: new Date('1988-11-30'),
        telefone: '(11) 96543-2109',
        email: 'pedro.alves@email.com',
        genero: 'Masculino',
        escolaridade: 'Médio Completo',
        cep: '01310-300',
        logradouro: 'Avenida Paulista',
        numero: '3000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        zonaEleitoral: '001',
        secao: '0125',
        criadoPorId: adminPrincipal.id,
      },
    ],
  });

  console.log(`✅ ${eleitores1.count} eleitores criados para Admin Principal`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- 1 Super Admin: ${adminPrincipal.nome}`);
  console.log(`- ${eleitores1.count} Eleitores cadastrados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
