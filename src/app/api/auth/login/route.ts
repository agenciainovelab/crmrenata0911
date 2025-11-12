import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

// Rate limiting simples (em memória - para produção usar Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minutos
    return true;
  }

  if (attempt.count >= 5) {
    return false; // Bloqueado
  }

  attempt.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const usuario = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        role: true,
        foto: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Verify password
    const senhaCorreta = await bcrypt.compare(
      validatedData.senha,
      usuario.senhaHash
    );

    if (!senhaCorreta) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Gerar tokens JWT
    const tokenPayload = {
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Definir cookies
    await setAuthCookies(accessToken, refreshToken);

    // Limpar tentativas de login após sucesso
    loginAttempts.delete(ip);

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        foto: usuario.foto,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}
