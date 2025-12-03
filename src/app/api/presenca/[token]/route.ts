import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const presencaSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido'),
  dataNascimento: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 120;
  }, 'Deve ter entre 16 e 120 anos'),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR']),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
});

// GET - Buscar informações do evento pelo token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const evento = await prisma.eventoPresenca.findUnique({
      where: { linkUnico: params.token },
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
                nome: true,
                telefone: true,
              },
            },
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento não encontrado ou link inválido' },
        { status: 404 }
      );
    }

    // Verificar se o evento está ativo
    if (!evento.ativo) {
      return NextResponse.json(
        { error: 'Este evento não está mais ativo' },
        { status: 410 }
      );
    }

    // Verificar se o link expirou
    if (evento.expiraEm && new Date() > new Date(evento.expiraEm)) {
      return NextResponse.json(
        { error: 'Este link expirou' },
        { status: 410 }
      );
    }

    // Verificar limite de participantes
    if (evento.limite && evento.totalConfirmacoes >= evento.limite) {
      return NextResponse.json(
        { error: 'Limite de participantes atingido' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      dataEvento: evento.dataEvento,
      local: evento.local,
      limite: evento.limite,
      totalConfirmacoes: evento.totalConfirmacoes,
      subgrupo: evento.subgrupo,
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    );
  }
}

// POST - Confirmar presença (criar eleitor)
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const validatedData = presencaSchema.parse(body);

    // Buscar evento
    const evento = await prisma.eventoPresenca.findUnique({
      where: { linkUnico: params.token },
      include: {
        subgrupo: {
          include: {
            grupo: true,
            responsavel: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento não encontrado ou link inválido' },
        { status: 404 }
      );
    }

    // Verificar se o evento está ativo
    if (!evento.ativo) {
      return NextResponse.json(
        { error: 'Este evento não está mais ativo' },
        { status: 410 }
      );
    }

    // Verificar se o link expirou
    if (evento.expiraEm && new Date() > new Date(evento.expiraEm)) {
      return NextResponse.json(
        { error: 'Este link expirou' },
        { status: 410 }
      );
    }

    // Verificar limite de participantes
    if (evento.limite && evento.totalConfirmacoes >= evento.limite) {
      return NextResponse.json(
        { error: 'Limite de participantes atingido' },
        { status: 410 }
      );
    }

    // Verificar se já existe eleitor com este telefone
    const eleitorExistente = await prisma.eleitor.findFirst({
      where: {
        telefone: validatedData.telefone,
      },
    });

    if (eleitorExistente) {
      // Atualizar relação com evento
      const eleitorAtualizado = await prisma.eleitor.update({
        where: { id: eleitorExistente.id },
        data: {
          grupoId: evento.subgrupo.grupoId,
          subgrupoId: evento.subgrupoId,
          eventoId: evento.id,
          // Atualizar outros dados se necessário
          nomeCompleto: validatedData.nomeCompleto,
          email: validatedData.email || eleitorExistente.email,
          dataNascimento: new Date(validatedData.dataNascimento),
          genero: validatedData.genero,
          cidade: validatedData.cidade,
        },
      });

      // Incrementar total de confirmações
      await prisma.eventoPresenca.update({
        where: { id: evento.id },
        data: {
          totalConfirmacoes: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Presença confirmada com sucesso!',
        eleitor: {
          id: eleitorAtualizado.id,
          nome: eleitorAtualizado.nomeCompleto,
        },
        evento: {
          titulo: evento.titulo,
          dataEvento: evento.dataEvento,
        },
      }, { status: 200 });
    }

    // Criar novo eleitor
    const eleitor = await prisma.eleitor.create({
      data: {
        nomeCompleto: validatedData.nomeCompleto,
        email: validatedData.email || null,
        telefone: validatedData.telefone,
        dataNascimento: new Date(validatedData.dataNascimento),
        genero: validatedData.genero,
        cidade: validatedData.cidade,
        uf: 'SP', // Padrão
        grupoId: evento.subgrupo.grupoId,
        subgrupoId: evento.subgrupoId,
        criadoPorId: evento.subgrupo.responsavelId,
        origem: 'link_presenca',
        eventoId: evento.id,
      },
    });

    // Incrementar total de confirmações
    await prisma.eventoPresenca.update({
      where: { id: evento.id },
      data: {
        totalConfirmacoes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Presença confirmada com sucesso!',
      eleitor: {
        id: eleitor.id,
        nome: eleitor.nomeCompleto,
      },
      evento: {
        titulo: evento.titulo,
        dataEvento: evento.dataEvento,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao confirmar presença:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar presença' },
      { status: 500 }
    );
  }
}
