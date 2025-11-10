import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';

interface HierarchyNode {
  id: string;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'LIDER';
  tipo: 'usuario';
  eleitores: Array<{
    id: string;
    nomeCompleto: string;
    cidade: string;
    uf: string;
    tipo: 'eleitor';
  }>;
  subordinados: HierarchyNode[];
}

// GET - Buscar hierarquia completa
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // Chave de cache
    const cacheKey = userId 
      ? `hierarquia:user:${userId}` 
      : 'hierarquia:full';
    
    // Tentar obter do cache
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }
    
    console.log(`❌ Cache MISS: ${cacheKey}`);
    
    // Se userId específico, buscar apenas aquele nó
    if (userId) {
      const node = await buildHierarchyNode(userId);
      if (!node) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      
      await setCache(cacheKey, node, 300); // 5 minutos
      return NextResponse.json(node);
    }
    
    // Buscar todos os Super Admins (raiz da árvore)
    const superAdmins = await prisma.usuario.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });
    
    // Construir árvore completa para cada Super Admin
    const hierarchy = await Promise.all(
      superAdmins.map((admin: any) => buildHierarchyNode(admin.id))
    );
    
    // Salvar no cache (5 minutos)
    await setCache(cacheKey, hierarchy, 300);
    
    return NextResponse.json(hierarchy);
  } catch (error) {
    console.error('Erro ao buscar hierarquia:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar hierarquia' },
      { status: 500 }
    );
  }
}

// Função recursiva para construir nó da hierarquia
async function buildHierarchyNode(userId: string): Promise<HierarchyNode | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  });
  
  if (!usuario) return null;
  
  // Buscar eleitores cadastrados por este usuário
  const eleitores = await prisma.eleitor.findMany({
    where: { criadoPorId: userId },
    select: {
      id: true,
      nomeCompleto: true,
      cidade: true,
      uf: true,
    },
    take: 100, // Limitar para performance
  });
  
  // Buscar usuários subordinados (que este usuário cadastrou)
  // Nota: Assumindo que há um campo criadoPorId em Usuario também
  // Se não existir, precisará ajustar o schema
  const subordinados = await prisma.usuario.findMany({
    where: {
      // Aqui você precisará ajustar conforme seu schema
      // Por enquanto, vamos buscar por role hierárquico
      role: usuario.role === 'SUPER_ADMIN' 
        ? 'ADMIN' 
        : usuario.role === 'ADMIN' 
          ? 'LIDER' 
          : undefined,
    },
    select: {
      id: true,
    },
    take: 50, // Limitar para performance
  });
  
  // Construir nós filhos recursivamente
  const subordinadosNodes = await Promise.all(
    subordinados.map((sub: any) => buildHierarchyNode(sub.id))
  );
  
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role as any,
    tipo: 'usuario',
    eleitores: eleitores.map(e => ({
      ...e,
      tipo: 'eleitor' as const,
    })),
    subordinados: subordinadosNodes.filter(Boolean) as HierarchyNode[],
  };
}
