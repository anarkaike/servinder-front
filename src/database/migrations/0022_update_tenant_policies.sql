-- Função para armazenar o contexto do tenant
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o tenant atual
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para obter o usuário atual com seu tenant
CREATE OR REPLACE FUNCTION get_current_user_tenant()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Atualiza as políticas RLS para tenants
DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
CREATE POLICY tenant_isolation_policy ON tenants
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.jwt()->>'role' = 'service_role' THEN true
      WHEN auth.jwt()->>'role' = 'authenticated' THEN id = get_current_user_tenant()
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.jwt()->>'role' = 'service_role' THEN true
      WHEN auth.jwt()->>'role' = 'authenticated' THEN id = get_current_user_tenant()
      ELSE false
    END
  );

-- Atualiza as políticas RLS para users
DROP POLICY IF EXISTS user_tenant_isolation_policy ON users;
CREATE POLICY user_tenant_isolation_policy ON users
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.jwt()->>'role' = 'service_role' THEN true
      WHEN auth.jwt()->>'role' = 'authenticated' THEN tenant_id = get_current_user_tenant()
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.jwt()->>'role' = 'service_role' THEN true
      WHEN auth.jwt()->>'role' = 'authenticated' THEN tenant_id = get_current_user_tenant()
      ELSE false
    END
  );

-- Função para trocar o banco de dados do tenant
CREATE OR REPLACE FUNCTION switch_tenant_database(database_name text)
RETURNS void AS $$
BEGIN
  -- Aqui você pode implementar a lógica para trocar de banco
  -- Por exemplo, usando dblink ou alterando o search_path
  EXECUTE format('SET search_path TO %I', database_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
