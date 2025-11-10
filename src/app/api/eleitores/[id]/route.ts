import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eleitorSchema } from '@/lib/validations/eleitor';
import { getCache, setCache, deleteCachePattern } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'eleitores';

// GET - Buscar eleitor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `${CACHE_KEY_PREFIX}:detail:${id}`;
    
    // Tentar obter do cache
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }
    
    console.log(`❌ Cache MISS: ${cacheKey}`);
    
    const eleitor = await prisma.eleitor.findUnique({
      where: { id },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    if (!eleitor) {
      return NextResponse.json(
        { error: 'Eleitor não encontrado' },
        { status: 404 }
      );
    }
    
    // Salvar no cache (5 minutos)
    await setCache(cacheKey, eleitor, 300);
    
    return NextResponse.json(eleitor);
  } catch (error) {
    console.error('Erro ao buscar eleitor:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eleitor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar eleitor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validar dados com Zod
    const validatedData = eleitorSchema.parse(body);
    
    // Verificar se eleitor existe
    const existingEleitor = await prisma.eleitor.findUnique({
      where: { id },
    });
    
    if (!existingEleitor) {
      return NextResponse.json(
        { error: 'Eleitor não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se CPF já existe em outro eleitor
    if (validatedData.cpf !== existingEleitor.cpf) {
      const cpfExists = await prisma.eleitor.findUnique({
        where: { cpf: validatedData.cpf },
      });
      
      if (cpfExists) {
        return NextResponse.json(
          { error: 'CPF já cadastrado' },
          { status: 400 }
        );
      }
    }
    
    // Atualizar eleitor
    const eleitor = await prisma.eleitor.update({
      where: { id },
      data: {
        ...validatedData,
        dataNascimento: new Date(validatedData.dataNascimento),
        email: validatedData.email || null,
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
      },
    });
    
    // 🗑️ INVALIDAR CACHE após atualizar
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após atualizar eleitor`);
    
    return NextResponse.json(eleitor);
  } catch (error: any) {
    console.error('Erro ao atualizar eleitor:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar eleitor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar eleitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar se eleitor existe
    const existingEleitor = await prisma.eleitor.findUnique({
      where: { id },
    });
    
    if (!existingEleitor) {
      return NextResponse.json(
        { error: 'Eleitor não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar eleitor
    await prisma.eleitor.delete({
      where: { id },
    });
    
    // 🗑️ INVALIDAR CACHE após deletar
    const deletedKeys = await deleteCachePattern(`${CACHE_KEY_PREFIX}:*`);
    console.log(`🔄 Cache invalidado: ${deletedKeys} chaves removidas após deletar eleitor`);
    
    return NextResponse.json({ message: 'Eleitor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar eleitor:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar eleitor' },
      { status: 500 }
    );
  }
}
