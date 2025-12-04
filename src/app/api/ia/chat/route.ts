import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI de forma lazy para evitar erro no build
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    const client = getOpenAI();

    const systemPrompt = `Você é um assistente de IA especializado em campanhas políticas e análise de dados eleitorais.
Você ajuda a analisar dados de eleitores, sugerir estratégias de campanha, identificar padrões e fornecer insights valiosos.
Responda sempre em português brasileiro de forma clara, objetiva e profissional.
${context ? `Contexto adicional: ${context}` : ''}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Erro ao processar chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
