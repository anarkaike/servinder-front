import { Migration } from './Migration.js'

export class RecreateTesteTable implements Migration {
  name = 'recreate_teste_table'

  async up(): Promise<string> {
    return `
      -- Remover a tabela existente
      DROP TABLE IF EXISTS public.teste CASCADE;

      -- Criar a tabela teste
      CREATE TABLE public.teste (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Criar função de atualização do updated_at
      CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language plpgsql;

      -- Criar trigger para atualizar updated_at
      DROP TRIGGER IF EXISTS set_teste_updated_at ON public.teste;
      CREATE TRIGGER set_teste_updated_at
        BEFORE UPDATE ON public.teste
        FOR EACH ROW
        EXECUTE FUNCTION public.set_current_timestamp_updated_at();

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
      GRANT USAGE ON SEQUENCE public.teste_id_seq TO authenticated;
    `
  }

  async down(): Promise<string> {
    return `
      DROP TRIGGER IF EXISTS set_teste_updated_at ON public.teste;
      DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at();
      DROP TABLE IF EXISTS public.teste;
    `
  }
}
