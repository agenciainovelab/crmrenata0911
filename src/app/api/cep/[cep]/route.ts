import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const cep = params.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar CEP' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    if (data.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      cep: data.cep.replace('-', ''),
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    });
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CEP' },
      { status: 500 }
    );
  }
}
