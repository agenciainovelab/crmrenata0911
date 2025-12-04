import { z } from 'zod';

export const eleitorSchema = z.object({
  // Dados pessoais
  nomeCompleto: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  dataNascimento: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 120;
  }, 'Eleitor deve ter entre 16 e 120 anos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR']),
  escolaridade: z.enum([
    'FUNDAMENTAL_INCOMPLETO',
    'FUNDAMENTAL_COMPLETO',
    'MEDIO_INCOMPLETO',
    'MEDIO_COMPLETO',
    'SUPERIOR_INCOMPLETO',
    'SUPERIOR_COMPLETO',
    'POS_GRADUACAO',
    'MESTRADO',
    'DOUTORADO',
  ]),
  
  // Endereço
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  
  // Dados eleitorais (aceita string vazia ou undefined)
  zonaEleitoral: z.string().optional().or(z.literal('')),
  secao: z.string().optional().or(z.literal('')),

  // Relacionamento
  criadoPorId: z.string().uuid('ID do líder inválido'),

  // Grupo e Subgrupo (opcionais)
  grupoId: z.string().uuid('ID do grupo inválido').optional().or(z.literal('')),
  subgrupoId: z.string().uuid('ID do subgrupo inválido').optional().or(z.literal('')),
});

export type EleitorInput = z.infer<typeof eleitorSchema>;
