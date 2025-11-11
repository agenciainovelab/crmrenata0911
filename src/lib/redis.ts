import Redis from 'ioredis';

// Configuração do Redis com fallback gracioso
let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // Tentar reconectar apenas 3 vezes
      if (times > 3) {
        console.log('⚠️ Redis indisponível - funcionando sem cache');
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  // Event handlers
  redis.on('connect', () => {
    console.log('✅ Redis conectado com sucesso');
    redisAvailable = true;
  });

  redis.on('error', (err) => {
    redisAvailable = false;
    // Só loga erro de conexão uma vez
    if (!err.message.includes('ECONNREFUSED')) {
      console.error('❌ Erro no Redis:', err.message);
    }
  });

  redis.on('close', () => {
    redisAvailable = false;
  });

  // Tentar conectar
  redis.connect().catch(() => {
    console.log('⚠️ Redis não disponível - sistema funcionará sem cache');
    redisAvailable = false;
  });
} catch (error) {
  console.log('⚠️ Redis não disponível - sistema funcionará sem cache');
  redisAvailable = false;
}

// Função helper para get com parse automático
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || !redisAvailable) return null;

  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    return null;
  }
}

// Função helper para set com stringify automático
export async function setCache(
  key: string,
  value: any,
  ttl: number = 300 // 5 minutos padrão
): Promise<boolean> {
  if (!redis || !redisAvailable) return false;

  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

// Função para deletar cache
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis || !redisAvailable) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

// Função para deletar múltiplas chaves por padrão
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!redis || !redisAvailable) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    return deleted;
  } catch (error) {
    return 0;
  }
}

// Função para invalidar todo o cache
export async function flushAllCache(): Promise<boolean> {
  if (!redis || !redisAvailable) return false;

  try {
    await redis.flushall();
    return true;
  } catch (error) {
    return false;
  }
}

// Função para verificar se uma chave existe
export async function cacheExists(key: string): Promise<boolean> {
  if (!redis || !redisAvailable) return false;

  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    return false;
  }
}

// Função para obter TTL restante
export async function getCacheTTL(key: string): Promise<number> {
  if (!redis || !redisAvailable) return -1;

  try {
    return await redis.ttl(key);
  } catch (error) {
    return -1;
  }
}

// Função para incrementar contador
export async function incrementCache(key: string, amount: number = 1): Promise<number> {
  if (!redis || !redisAvailable) return 0;

  try {
    return await redis.incrby(key, amount);
  } catch (error) {
    return 0;
  }
}

// Função para obter estatísticas do cache
export async function getCacheStats() {
  if (!redis || !redisAvailable) return null;

  try {
    const info = await redis.info('stats');
    const keyspace = await redis.info('keyspace');
    const dbSize = await redis.dbsize();

    return {
      connected: redis.status === 'ready',
      dbSize,
      info,
      keyspace,
    };
  } catch (error) {
    return null;
  }
}

export default redis;
