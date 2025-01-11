import { Migration } from './Migration.js'

export class FixAuthTrigger implements Migration {
  name = 'fix_auth_trigger'

  async up(): Promise<string> {
    return `
      -- Remover trigger existente
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();

      -- Recriar função com security definer e search_path correto
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.users (id, email, name)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        );
        RETURN NEW;
      END;
      $$;

      -- Recriar trigger
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();

      -- Atualizar políticas de segurança
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
      DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON public.users;
      DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

      -- Criar novas políticas mais permissivas para inserção
      CREATE POLICY "Allow insert from auth trigger" ON public.users
        FOR INSERT WITH CHECK (true);

      CREATE POLICY "Allow select for authenticated users" ON public.users
        FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);

      CREATE POLICY "Allow update for own profile" ON public.users
        FOR UPDATE USING (auth.uid() = id);
    `
  }

  async down(): Promise<string> {
    return `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
      DROP POLICY IF EXISTS "Allow insert from auth trigger" ON public.users;
      DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.users;
      DROP POLICY IF EXISTS "Allow update for own profile" ON public.users;
    `
  }
}
