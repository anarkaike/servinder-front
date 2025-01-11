import { pgFunction } from 'drizzle-orm/pg-core';

// Função para armazenar o contexto do tenant em uma variável de sessão
export const setTenantContext = pgFunction('set_tenant_context', {
  args: [{ name: 'p_tenant_id', type: 'uuid' }],
  returns: 'void',
  language: 'plpgsql',
  security: 'definer',
  definition: `
    BEGIN
      -- Define uma variável de sessão com o ID do tenant
      PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
    END;
  `
});

// Função para obter o tenant atual da sessão
export const getCurrentTenantId = pgFunction('get_current_tenant_id', {
  args: [],
  returns: 'uuid',
  language: 'plpgsql',
  security: 'definer',
  definition: `
    BEGIN
      RETURN current_setting('app.current_tenant_id', true)::uuid;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN NULL;
    END;
  `
});

// Função para obter o tenant do usuário atual
export const getCurrentUserTenant = pgFunction('get_current_user_tenant', {
  args: [],
  returns: 'uuid',
  language: 'plpgsql',
  security: 'definer',
  definition: `
    DECLARE
      v_tenant_id uuid;
    BEGIN
      SELECT tenant_id INTO v_tenant_id
      FROM public.users
      WHERE id = auth.uid();
      
      RETURN v_tenant_id;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN NULL;
    END;
  `
});
