-- Hash bcrypt da senha '123456': $2b$10$rBV2kbCBOUOxa3qm9X5Pc.8y9I5YHPjXMb3q7V5Kz0p8Cz0kZQzKS

-- Super Admin
INSERT INTO usuarios (id, nome, email, "senhaHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Leonardo Barros',
  'leo@inovelab.app',
  '$2b$10$rBV2kbCBOUOxa3qm9X5Pc.8y9I5YHPjXMb3q7V5Kz0p8Cz0kZQzKS',
  'SUPER_ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  "senhaHash" = EXCLUDED."senhaHash",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Admin Renata
INSERT INTO usuarios (id, nome, email, "senhaHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Renata Daguiar',
  'renata@renatadaguiar.com',
  '$2b$10$rBV2kbCBOUOxa3qm9X5Pc.8y9I5YHPjXMb3q7V5Kz0p8Cz0kZQzKS',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  "senhaHash" = EXCLUDED."senhaHash",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Admin Letícia
INSERT INTO usuarios (id, nome, email, "senhaHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Letícia',
  'leticia@renatadaguiar.com',
  '$2b$10$rBV2kbCBOUOxa3qm9X5Pc.8y9I5YHPjXMb3q7V5Kz0p8Cz0kZQzKS',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  "senhaHash" = EXCLUDED."senhaHash",
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Líder Geral João
INSERT INTO usuarios (id, nome, email, "senhaHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'João',
  'joao@renatadaguiar.com',
  '$2b$10$rBV2kbCBOUOxa3qm9X5Pc.8y9I5YHPjXMb3q7V5Kz0p8Cz0kZQzKS',
  'LIDER',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  "senhaHash" = EXCLUDED."senhaHash",
  role = EXCLUDED.role,
  "updatedAt" = NOW();
