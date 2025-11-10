import Redis from 'ioredis';

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redis.on('error', (err) => {
  console.error('❌ Erro no Redis:', err);
});

// Função helper para get com parse automático
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Erro ao buscar cache ${key}:`, error);
    return null;
  }
}

// Função helper para set com stringify automático
export async function setCache(
  key: string,
  value: any,
  ttl: number = 300 // 5 minutos padrão
): Promise<boolean> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar cache ${key}:`, error);
    return false;
  }
}

// Função para deletar cache
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar cache ${key}:`, error);
    return false;
  }
}

// Função para deletar múltiplas chaves por padrão
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    const deleted = await redis.del(...keys);
    console.log(`🗑️ ${deleted} chaves deletadas com padrão: ${pattern}`);
    return deleted;
  } catch (error) {
    console.error(`Erro ao deletar cache com padrão ${pattern}:`, error);
    return 0;
  }
}

// Função para invalidar todo o cache
export async function flushAllCache(): Promise<boolean> {
  try {
    await redis.flushall();
    console.log('🗑️ Todo o cache foi limpo');
    return true;
  } catch (error) {
    console.error('Erro ao limpar todo o cache:', error);
    return false;
  }
}

// Função para verificar se uma chave existe
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Erro ao verificar existência do cache ${key}:`, error);
    return false;
  }
}

// Função para obter TTL restante
export async function getCacheTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error(`Erro ao obter TTL do cache ${key}:`, error);
    return -1;
  }
}

// Função para incrementar contador
export async function incrementCache(key: string, amount: number = 1): Promise<number> {
  try {
    return await redis.incrby(key, amount);
  } catch (error) {
    console.error(`Erro ao incrementar cache ${key}:`, error);
    return 0;
  }
}

// Função para obter estatísticas do cache
export async function getCacheStats() {
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
    console.error('Erro ao obter estatísticas do cache:', error);
    return null;
  }
}

export default redis;
