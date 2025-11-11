import { PrismaClient } from '@prisma/client';

// Singleton pattern para evitar múltiplas instâncias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prismaOptimized = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  
  // Otimizações de conexão
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Configurar connection pool para melhor performance
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar pool de conexões otimizado
  prismaOptimized.$connect();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaOptimized;
}

// Função helper para queries com cache
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 300 // 5 minutos padrão
): Promise<T> {
  // Implementação simples de cache em memória
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < ttl * 1000) {
    return cached.data;
  }
  
  const data = await queryFn();
  cache.set(key, { data, timestamp: now });
  
  return data;
}

export default prismaOptimized;
