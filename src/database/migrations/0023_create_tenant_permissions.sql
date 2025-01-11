-- Tabela de roles por tenant
CREATE TABLE IF NOT EXISTS tenant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(tenant_id, name)
);

-- Tabela de permissões por tenant
CREATE TABLE IF NOT EXISTS tenant_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(tenant_id, name)
);

-- Tabela de relacionamento entre roles e permissões
CREATE TABLE IF NOT EXISTS tenant_role_permissions (
  role_id UUID NOT NULL REFERENCES tenant_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES tenant_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- Tabela de relacionamento entre usuários e roles
CREATE TABLE IF NOT EXISTS tenant_user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES tenant_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, role_id)
);

-- Políticas RLS para roles
ALTER TABLE tenant_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_roles_isolation_policy ON tenant_roles
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_user_tenant())
  WITH CHECK (tenant_id = get_current_user_tenant());

-- Políticas RLS para permissões
ALTER TABLE tenant_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_permissions_isolation_policy ON tenant_permissions
  FOR ALL
  TO authenticated
  USING (tenant_id = get_current_user_tenant())
  WITH CHECK (tenant_id = get_current_user_tenant());

-- Políticas RLS para relacionamentos
ALTER TABLE tenant_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_role_permissions_isolation_policy ON tenant_role_permissions
  FOR ALL
  TO authenticated
  USING (
    role_id IN (
      SELECT id FROM tenant_roles WHERE tenant_id = get_current_user_tenant()
    )
  )
  WITH CHECK (
    role_id IN (
      SELECT id FROM tenant_roles WHERE tenant_id = get_current_user_tenant()
    )
  );

ALTER TABLE tenant_user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_user_roles_isolation_policy ON tenant_user_roles
  FOR ALL
  TO authenticated
  USING (
    role_id IN (
      SELECT id FROM tenant_roles WHERE tenant_id = get_current_user_tenant()
    )
  )
  WITH CHECK (
    role_id IN (
      SELECT id FROM tenant_roles WHERE tenant_id = get_current_user_tenant()
    )
  );

-- Função para verificar permissão
CREATE OR REPLACE FUNCTION check_tenant_permission(
  user_id UUID,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM tenant_user_roles ur
    JOIN tenant_role_permissions rp ON rp.role_id = ur.role_id
    JOIN tenant_permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = $1
    AND p.name = $2
    AND p.tenant_id = get_current_user_tenant()
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
