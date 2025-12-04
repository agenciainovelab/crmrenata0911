import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Enviar campanha de email via Brevo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, assunto, conteudoHtml, conteudoTexto, remetenteNome, remetenteEmail } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum eleitor selecionado' },
        { status: 400 }
      );
    }

    if (!assunto || !conteudoHtml) {
      return NextResponse.json(
        { error: 'Assunto e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar eleitores com email válido
    const eleitores = await prisma.eleitor.findMany({
      where: {
        id: { in: ids },
        email: { not: null },
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
      },
    });

    if (eleitores.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum eleitor selecionado possui email cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se a API key do Brevo está configurada
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return NextResponse.json(
        { error: 'Chave da API Brevo não configurada. Adicione BREVO_API_KEY no .env' },
        { status: 500 }
      );
    }

    // Preparar destinatários
    const destinatarios = eleitores
      .filter(e => e.email)
      .map(e => ({
        email: e.email!,
        name: e.nomeCompleto,
      }));

    // Enviar via API do Brevo (Sendinblue)
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: remetenteNome || 'Campanha Inteligente',
          email: remetenteEmail || 'noreply@campanhainteligente.com.br',
        },
        to: destinatarios,
        subject: assunto,
        htmlContent: conteudoHtml,
        textContent: conteudoTexto || '',
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error('Erro Brevo:', errorData);
      return NextResponse.json(
        {
          error: 'Erro ao enviar emails via Brevo',
          details: errorData.message || 'Verifique a configuração da API'
        },
        { status: 500 }
      );
    }

    const brevoResult = await brevoResponse.json();

    return NextResponse.json({
      success: true,
      count: destinatarios.length,
      messageId: brevoResult.messageId,
      message: `Campanha de email enviada para ${destinatarios.length} eleitor(es)`,
    });
  } catch (error: any) {
    console.error('Erro ao enviar campanha de email:', error);

    return NextResponse.json(
      { error: 'Erro ao enviar emails' },
      { status: 500 }
    );
  }
}
