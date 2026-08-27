-- ============================================================
-- PLATAFORMA - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Database: nexla_acesso
-- Execute este script no seu PostgreSQL
-- ============================================================

-- Garantir que está usando o banco correto
\c nexla_acesso;

-- ============================================================
-- 1. CRIAR TABELAS
-- ============================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Tipos de Análise
CREATE TABLE IF NOT EXISTS analysis_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  ai_model VARCHAR(100) NOT NULL,
  template TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_type_id UUID NOT NULL REFERENCES analysis_types(id) ON DELETE RESTRICT,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Tabela de Uso de Tokens
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  analysis_type_id UUID NOT NULL REFERENCES analysis_types(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_analysis_types_active ON analysis_types(is_active);
CREATE INDEX IF NOT EXISTS idx_analysis_types_created_by ON analysis_types(created_by);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_analysis_type_id ON documents(analysis_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_analysis_type_id ON token_usage(analysis_type_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_document_id ON token_usage(document_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at DESC);

-- ============================================================
-- 3. CRIAR FUNÇÕES E TRIGGERS
-- ============================================================

-- Função para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para analysis_types
DROP TRIGGER IF EXISTS update_analysis_types_updated_at ON analysis_types;
CREATE TRIGGER update_analysis_types_updated_at
  BEFORE UPDATE ON analysis_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. CRIAR USUÁRIOS INICIAIS (DESENVOLVIMENTO)
-- ============================================================

-- Usuário Admin
-- Email: admin@exemplo.com
-- Senha: SENHA_EXEMPLO
INSERT INTO users (email, password, full_name, role)
VALUES (
  'admin@exemplo.com',
  'BCRYPT_HASH_EXEMPLO',
  'Administrador Sistema',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Usuário Comum (para testes)
-- Email: user@exemplo.com
-- Senha: User@2024
INSERT INTO users (email, password, full_name, role)
VALUES (
  'user@exemplo.com',
  'BCRYPT_HASH_EXEMPLO',
  'Usuário Teste',
  'user'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 5. CRIAR TIPOS DE ANÁLISE PADRÃO (OPCIONAL)
-- ============================================================

-- Você pode criar tipos de análise padrão aqui ou através da interface

-- Exemplo:
-- INSERT INTO analysis_types (name, description, ai_model, template, is_active)
-- VALUES (
--   'Análise Geral de Documentos',
--   'Análise geral e extração de informações relevantes',
--   'gpt-4',
--   'Analise o seguinte documento e extraia as informações mais relevantes...',
--   true
-- );

-- ============================================================
-- 6. VERIFICAR CRIAÇÃO DAS TABELAS
-- ============================================================

\dt

-- ============================================================
-- 7. VERIFICAR DADOS
-- ============================================================

SELECT
  'Users' as tabela,
  COUNT(*) as total
FROM users
UNION ALL
SELECT
  'Analysis Types' as tabela,
  COUNT(*) as total
FROM analysis_types
UNION ALL
SELECT
  'Documents' as tabela,
  COUNT(*) as total
FROM documents
UNION ALL
SELECT
  'Token Usage' as tabela,
  COUNT(*) as total
FROM token_usage;

-- ============================================================
-- CONCLUÍDO!
-- ============================================================

-- Próximos passos:
-- 1. Verificar se o usuário admin foi criado
-- 2. Iniciar o backend: npm run start:dev
-- 3. Acessar http://localhost:5173
-- 4. Fazer login com admin@exemplo.com / SENHA_EXEMPLO
-- 5. TROCAR A SENHA imediatamente!
