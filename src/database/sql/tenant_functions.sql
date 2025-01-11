-- Função para armazenar o contexto do tenant em uma variável de sessão
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_tenant_id text)
RETURNS void AS $$
BEGIN
  -- Define uma variável de sessão com o ID do tenant
  PERFORM set_config('app.current_tenant_id', p_tenant_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o tenant atual da sessão
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para obter o tenant do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_tenant()
RETURNS text AS $$
DECLARE
  v_tenant_id text;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN v_tenant_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Política RLS para tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON public.tenants
  USING (id = COALESCE(current_setting('app.current_tenant_id', true), id)::text);

-- Política RLS para usuários
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_tenant_isolation_policy ON public.users
  USING (tenant_id = COALESCE(current_setting('app.current_tenant_id', true), tenant_id)::text);
