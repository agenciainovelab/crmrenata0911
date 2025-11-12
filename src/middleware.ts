import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

// Rotas públicas que não requerem autenticação
const publicRoutes = ['/auth/sign-in', '/auth/forgot-password', '/auth/reset-password'];

// Rotas de API públicas
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso a rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir acesso a APIs públicas
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    // Redirecionar para login se não autenticado
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    return NextResponse.redirect(url);
  }

  try {
    // Verificar validade do token
    await jwtVerify(token, JWT_SECRET);
    
    // Token válido, permitir acesso
    return NextResponse.next();
  } catch (error) {
    // Token inválido ou expirado
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico|public).*)',
  ],
};
