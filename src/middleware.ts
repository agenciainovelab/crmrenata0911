import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acesso à página de login
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }
  
  // Redirecionar para login se não autenticado (verificação client-side)
  // Em produção, usar cookies/tokens para verificação server-side
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
