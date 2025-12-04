import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const eventoUpdateSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').optional(),
  descricao: z.string().optional(),
  dataEvento: z.string().refine((date) => {
    const eventDate = new Date(date);
    return !isNaN(eventDate.getTime());
  }, 'Data do evento inválida').optional(),
  local: z.string().optional(),
  limite: z.number().int().positive('Limite deve ser um número positivo').optional(),
  expiraEm: z.string().optional().refine((date) => {
    if (!date) return true;
    const expDate = new Date(date);
    return !isNaN(expDate.getTime());
  }, 'Data de expiração inválida').optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar evento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evento = await prisma.eventoPresenca.findUnique({
      where: { id },
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

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Construir URL pública do evento
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const linkPublico = `${appUrl}/presenca/${evento.linkUnico}`;

    return NextResponse.json({
      ...evento,
      linkPublico,
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = eventoUpdateSchema.parse(body);

    // Verificar se o evento existe
    const eventoExistente = await prisma.eventoPresenca.findUnique({
      where: { id },
    });

    if (!eventoExistente) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = { ...validatedData };

    if (validatedData.dataEvento) {
      updateData.dataEvento = new Date(validatedData.dataEvento);
    }

    if (validatedData.expiraEm) {
      updateData.expiraEm = new Date(validatedData.expiraEm);
    }

    const evento = await prisma.eventoPresenca.update({
      where: { id },
      data: updateData,
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
    const linkPublico = `${appUrl}/presenca/${evento.linkUnico}`;

    return NextResponse.json({
      ...evento,
      linkPublico,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar se o evento existe
    const evento = await prisma.eventoPresenca.findUnique({
      where: { id },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Avisar se há confirmações (não impede exclusão)
    if (evento.totalConfirmacoes > 0) {
      console.log(`Excluindo evento com ${evento.totalConfirmacoes} confirmações`);
    }

    await prisma.eventoPresenca.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso',
      totalConfirmacoes: evento.totalConfirmacoes,
    });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir evento' },
      { status: 500 }
    );
  }
}
