-- =====================================================================
-- SCRIPT SQL PARA INICIALIZAÇÃO DO BANCO DE DADOS NO SUPABASE
-- Copie todo o código abaixo e cole no SQL Editor do seu projeto Supabase
-- =====================================================================

-- 1. Criar a tabela 'respostas_pesquisa'
create table if not exists respostas_pesquisa (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  cliente_nome text,
  pergunta_atendimento text not null,
  pergunta_comida text not null,
  pergunta_ambiente text not null,
  pergunta_retorno text not null,
  comentario text
);

-- 2. Habilitar o RLS (Row Level Security) para garantir a segurança básica
alter table respostas_pesquisa enable row level security;

-- 3. Criar política de segurança para permitir que QUALQUER cliente grave dados (INSERT)
create policy "Permitir inserções públicas"
on respostas_pesquisa
for insert
with check (true);

-- 4. Criar política de segurança para permitir a leitura pública dos dados (SELECT)
-- Necessário para que o Dashboard Administrativo no frontend possa ler as respostas de forma anônima
create policy "Permitir leitura pública de dados"
on respostas_pesquisa
for select
using (true);
