import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live em segundos (padrão: 5 minutos)
  key: string;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function useCache<T>(options: CacheOptions) {
  const { key, ttl = 300 } = options; // 5 minutos padrão
  
  const getCachedData = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { data, timestamp }: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache expirou
      if (now - timestamp > ttl * 1000) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      return null;
    }
  }, [key, ttl]);
  
  const setCachedData = useCallback((data: T) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }, [key]);
  
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`cache_${key}`);
  }, [key]);
  
  return {
    getCachedData,
    setCachedData,
    clearCache,
  };
}

// Hook para fetch com cache automático
export function useCachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheOptions?: Omit<CacheOptions, 'key'>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheKey = `fetch_${url}`;
  const { getCachedData, setCachedData } = useCache<T>({
    key: cacheKey,
    ...cacheOptions,
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Tentar obter do cache primeiro
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
      
      // Se não houver cache, fazer fetch
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setCachedData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url, getCachedData, setCachedData]);
  
  return { data, loading, error };
}
