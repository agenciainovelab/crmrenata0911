import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const eventoPresencaSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  dataEvento: z.string().refine((date) => {
    const eventDate = new Date(date);
    return !isNaN(eventDate.getTime());
  }, 'Data do evento inválida'),
  local: z.string().optional(),
  subgrupoId: z.string().uuid('ID do subgrupo inválido'),
  limite: z.number().int().positive('Limite deve ser um número positivo').optional(),
  expiraEm: z.string().optional().refine((date) => {
    if (!date) return true;
    const expDate = new Date(date);
    return !isNaN(expDate.getTime());
  }, 'Data de expiração inválida'),
  ativo: z.boolean().default(true),
});

// Função para criar slug amigável
function criarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

// Função para gerar link único com slug amigável
function gerarLinkUnico(titulo: string): string {
  const slug = criarSlug(titulo);
  const codigo = randomBytes(4).toString('hex'); // 8 caracteres
  return `${slug}-${codigo}`;
}

// GET - Listar todos os eventos (com filtro opcional por subgrupo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subgrupoId = searchParams.get('subgrupoId');
    const ativo = searchParams.get('ativo');

    const where: any = {};

    if (subgrupoId) {
      where.subgrupoId = subgrupoId;
    }

    if (ativo !== null) {
      where.ativo = ativo === 'true';
    }

    const eventos = await prisma.eventoPresenca.findMany({
      where,
      include: {
        subgrupo: {
          select: {
            id: true,
            nome: true,
            grupo: {
              select: {
                id: true,
                nome: true,
                cor: true,
              },
            },
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataEvento: 'desc',
      },
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar eventos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo evento de presença
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = eventoPresencaSchema.parse(body);

    // Verificar se o subgrupo existe
    const subgrupo = await prisma.subgrupo.findUnique({
      where: { id: validatedData.subgrupoId },
      include: {
        grupo: true,
        responsavel: true,
      },
    });

    if (!subgrupo) {
      return NextResponse.json(
        { error: 'Subgrupo não encontrado' },
        { status: 404 }
      );
    }

    // Gerar link único baseado no título
    let linkUnico = gerarLinkUnico(validatedData.titulo);

    // Garantir que o link é único
    let existente = await prisma.eventoPresenca.findUnique({
      where: { linkUnico },
    });

    while (existente) {
      linkUnico = gerarLinkUnico(validatedData.titulo);
      existente = await prisma.eventoPresenca.findUnique({
        where: { linkUnico },
      });
    }

    const evento = await prisma.eventoPresenca.create({
      data: {
        ...validatedData,
        dataEvento: new Date(validatedData.dataEvento),
        expiraEm: validatedData.expiraEm ? new Date(validatedData.expiraEm) : null,
        linkUnico,
      },
      include: {
        subgrupo: {
          select: {
            id: true,
            nome: true,
            grupo: {
              select: {
                id: true,
                nome: true,
                cor: true,
              },
            },
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
      },
    });

    // Construir URL pública do evento
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const linkPublico = `${appUrl}/presenca/${linkUnico}`;

    return NextResponse.json({
      ...evento,
      linkPublico,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}
