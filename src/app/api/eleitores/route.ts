import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eleitorSchema } from '@/lib/validations/eleitor';
import { getCache, setCache, deleteCachePattern } from '@/lib/redis';

// Chave base para cache de eleitores
const CACHE_KEY_PREFIX = 'eleitores';

// GET - Listar eleitores com cache Redis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const subgrupoId = searchParams.get('subgrupoId') || '';
    const grupoId = searchParams.get('grupoId') || '';
    const novosCadastros = searchParams.get('novosCadastros') === 'true';
    const naoExportados = searchParams.get('naoExportados') === 'true';
    const bairro = searchParams.get('bairro') || '';
    const aquecido = searchParams.get('aquecido');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';

    // Gerar chave de cache única baseada nos parâmetros
    const cacheKey = `${CACHE_KEY_PREFIX}:list:page${page}:limit${limit}:search${search}:subgrupo${subgrupoId}:grupo${grupoId}:novos${novosCadastros}:naoExp${naoExportados}:bairro${bairro}:aquecido${aquecido}:sort${sortBy}${sortDir}`;

    // Tentar obter do cache primeiro
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      const response = NextResponse.json(cachedData);
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    console.log(`❌ Cache MISS: ${cacheKey}`);

    const skip = (page - 1) * limit;

    const where: any = search
      ? {
          OR: [
            { nomeCompleto: { contains: search, mode: 'insensitive' as const } },
            { cidade: { contains: search, mode: 'insensitive' as const } },
            { cpf: { contains: search } },
          ],
        }
      : {};

    // Adicionar filtros de grupo e subgrupo
    if (subgrupoId) {
      where.subgrupoId = subgrupoId;
    }
    if (grupoId) {
      where.grupoId = grupoId;
    }

    // Filtro de novos cadastros (últimos 7 dias)
    if (novosCadastros) {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      where.createdAt = { gte: seteDiasAtras };
    }

    // Filtro de não exportados
    if (naoExportados) {
      where.exportado = false;
    }

    // Filtro por bairro
    if (bairro) {
      where.bairro = { contains: bairro, mode: 'insensitive' as const };
    }

    // Filtro por aquecido
    if (aquecido === 'true') {
      where.aquecido = true;
    } else if (aquecido === 'false') {
      where.aquecido = false;
    }

    // Definir ordenação dinâmica - mapear nomes amigáveis para nomes do banco
    const sortFieldMap: Record<string, string> = {
      nome: 'nomeCompleto',
      nomeCompleto: 'nomeCompleto',
      data: 'createdAt',
      createdAt: 'createdAt',
      cidade: 'cidade',
      bairro: 'bairro',
    };
    const sortField = sortFieldMap[sortBy] || 'createdAt';
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortDirection };

    // Buscar eleitores e total em paralelo com select otimizado
    const [eleitores, total] = await Promise.all([
      prisma.eleitor.findMany({
        where,
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          telefone: true,
          email: true,
          bairro: true,
          cidade: true,
          uf: true,
          exportado: true,
          exportadoEm: true,
          aquecido: true,
          aquecidoEm: true,
          grupoId: true,
          subgrupoId: true,
          grupo: {
            select: {
              id: true,
              nome: true,
            },
          },
          subgrupo: {
            select: {
              id: true,
              nome: true,
            },
          },
          criadoPor: {
            select: {
              nome: true,
            },
          },
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.eleitor.count({ where }),
    ]);

    const responseData = {
      eleitores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Salvar no cache (30 segundos)
    await setCache(cacheKey, responseData, 30);

    const response = NextResponse.json(responseData);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Erro ao listar eleitores:', error);
    return NextResponse.json(
      { error: 'Erro ao listar eleitores' },
      { status: 500 }
    );
  }
}

// POST - Criar novo eleitor com invalidação de cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados com Zod
    const validatedData = eleitorSchema.parse(body);
    
    // Verificar se CPF já existe (otimizado com select)
    const existingEleitor = await prisma.eleitor.findUnique({
      where: { cpf: validatedData.cpf },
      select: { id: true },
    });
    
    if (existingEleitor) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      );
    }
    
    // Preparar dados para criação
    const { grupoId, subgrupoId, ...restData } = validatedData;

    // Criar eleitor
    const eleitor = await prisma.eleitor.create({
      data: {
        ...restData,
        dataNascimento: new Date(validatedData.dataNascimento),
        email: validatedData.email || null,
        grupoId: grupoId || null,
        subgrupoId: subgrupoId || null,
      },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
        grupo: {
          select: {
            id: true,
            nome: true,
          },
        },
        subgrupo: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
    
    // 🗑️ INVALIDAR CACHE após criar eleitor
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após criar eleitor`);
    
    return NextResponse.json(eleitor, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar eleitor:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar eleitor' },
      { status: 500 }
    );
  }
}
