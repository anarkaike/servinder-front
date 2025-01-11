import { Migration } from './Migration.js'

export class CreateTesteTable implements Migration {
  name = 'create_teste_table'

  async up(): Promise<string> {
    return `
      -- Criar a tabela teste se não existir
      CREATE TABLE IF NOT EXISTS public.teste (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Criar função de atualização do updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Criar trigger para atualizar updated_at
      DROP TRIGGER IF EXISTS update_teste_updated_at ON public.teste;
      CREATE TRIGGER update_teste_updated_at
        BEFORE UPDATE ON public.teste
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      -- Habilitar RLS
      ALTER TABLE public.teste ENABLE ROW LEVEL SECURITY;

      -- Remover políticas existentes
      DROP POLICY IF EXISTS "teste_select_policy" ON public.teste;
      DROP POLICY IF EXISTS "teste_insert_policy" ON public.teste;
      DROP POLICY IF EXISTS "teste_update_policy" ON public.teste;
      DROP POLICY IF EXISTS "teste_delete_policy" ON public.teste;

      -- Criar novas políticas
      CREATE POLICY "teste_select_policy" ON public.teste
        FOR SELECT USING (
          auth.role() = 'authenticated'
        );

      CREATE POLICY "teste_insert_policy" ON public.teste
        FOR INSERT WITH CHECK (
          auth.role() = 'authenticated'
        );

      CREATE POLICY "teste_update_policy" ON public.teste
        FOR UPDATE USING (
          auth.role() = 'authenticated'
        );

      CREATE POLICY "teste_delete_policy" ON public.teste
        FOR DELETE USING (
          auth.role() = 'authenticated'
        );

      -- Garantir permissões para usuários autenticados
      GRANT ALL ON public.teste TO authenticated;
    `
  }

  async down(): Promise<string> {
    return `
      DROP TRIGGER IF EXISTS update_teste_updated_at ON public.teste;
      DROP FUNCTION IF EXISTS update_updated_at_column();
      DROP TABLE IF EXISTS public.teste;
    `
  }
}
