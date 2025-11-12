/**
 * Testes para API de Login
 * 
 * Para executar: npm test
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock do JWT
jest.mock('@/lib/jwt', () => ({
  generateAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
  setAuthCookies: jest.fn().mockResolvedValue(undefined),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        senha: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Dados inválidos');
  });

  it('deve retornar erro 401 para credenciais incorretas', async () => {
    const { prisma } = require('@/lib/prisma');
    prisma.usuario.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'usuario@exemplo.com',
        senha: 'senha123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Email ou senha incorretos');
  });

  it('deve fazer login com sucesso para credenciais válidas', async () => {
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcrypt');

    const mockUser = {
      id: '123',
      nome: 'Usuário Teste',
      email: 'usuario@exemplo.com',
      senhaHash: 'hashed-password',
      role: 'ADMIN',
      foto: null,
    };

    prisma.usuario.findUnique.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'usuario@exemplo.com',
        senha: 'senha123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      id: mockUser.id,
      nome: mockUser.nome,
      email: mockUser.email,
      role: mockUser.role,
      foto: mockUser.foto,
    });
  });
});
