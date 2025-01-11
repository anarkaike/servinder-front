import { Migration } from './Migration.js'

export class VerifyUsersTable implements Migration {
  name = 'verify_users_table'

  async up(): Promise<string> {
    return `
      -- Verificar se a tabela users existe e criar se não existir
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        avatar_url TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Desabilitar RLS temporariamente para permitir a criação inicial
      ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

      -- Remover todas as políticas existentes
      DROP POLICY IF EXISTS "Allow insert from auth trigger" ON public.users;
      DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.users;
      DROP POLICY IF EXISTS "Allow update for own profile" ON public.users;
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
      DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON public.users;
      DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

      -- Recriar função do trigger com permissões corretas
      DROP FUNCTION IF EXISTS public.handle_new_user();
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        INSERT INTO public.users (id, email, name)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        );
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
          RETURN NEW;
      END;
      $$;

      -- Recriar trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();

      -- Habilitar RLS novamente
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- Criar novas políticas
      CREATE POLICY "users_insert_policy" 
        ON public.users FOR INSERT 
        WITH CHECK (true);

      CREATE POLICY "users_select_policy" 
        ON public.users FOR SELECT 
        USING (true);

      CREATE POLICY "users_update_policy" 
        ON public.users FOR UPDATE 
        USING (auth.uid() = id);

      -- Garantir que o usuário autenticado tenha acesso
      GRANT ALL ON public.users TO authenticated;
      GRANT ALL ON public.users TO service_role;
    `
  }

  async down(): Promise<string> {
    return `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
      DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
      DROP POLICY IF EXISTS "users_select_policy" ON public.users;
      DROP POLICY IF EXISTS "users_update_policy" ON public.users;
    `
  }
}
