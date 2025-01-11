-- Política para permitir inserção de novos usuários
CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir leitura de usuários
CREATE POLICY "Enable read access for authenticated users only" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Política para permitir atualização de usuários
CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
