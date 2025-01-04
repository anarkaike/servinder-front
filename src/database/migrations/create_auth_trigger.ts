import { Migration } from './Migration.js'

export class CreateAuthTrigger implements Migration {
  name = 'create_auth_trigger'

  async up(): Promise<string> {
    return `
      -- Função que será chamada quando um usuário for criado no Auth
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.users (id, email, name)
        values (new.id, new.email, new.raw_user_meta_data->>'name');

        return new;
      end;
      $$;

      -- Trigger que chama a função quando um usuário for criado
      drop trigger if exists on_auth_user_created on auth.users;
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();
    `
  }

  async down(): Promise<string> {
    return `
      drop trigger if exists on_auth_user_created on auth.users;
      drop function if exists public.handle_new_user();
    `
  }
}
