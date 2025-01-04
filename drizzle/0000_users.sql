-- Criar a tabela de usuários
create table public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.users enable row level security;

-- Criar política para permitir leitura pública
create policy "Allow public read access"
  on public.users
  for select
  using (true);

-- Criar política para permitir update apenas pelo próprio usuário
create policy "Allow individual update"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Criar política para permitir insert apenas para usuários autenticados
create policy "Allow authenticated insert"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
    before update on public.users
    for each row
    execute function update_updated_at_column();
