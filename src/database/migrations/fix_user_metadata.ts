import { Migration } from './Migration.js'

export class FixUserMetadata implements Migration {
  name = 'fix_user_metadata'

  async up(): Promise<string> {
    return `
      -- Atualizar a função do trigger para usar o caminho correto dos metadados
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
          COALESCE(
            (NEW.raw_user_meta_data->'user_metadata'->>'name')::text,
            split_part(NEW.email, '@', 1)
          )
        );
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'Error in handle_new_user: %', SQLERRM;
          RETURN NEW;
      END;
      $$;
    `
  }

  async down(): Promise<string> {
    return `
      -- Restaurar a versão anterior da função
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
          RAISE LOG 'Error in handle_new_user: %', SQLERRM;
          RETURN NEW;
      END;
      $$;
    `
  }
}
