import { ref, computed } from 'vue';
import { supabase } from '../boot/supabase';
import { useTenantStore } from '../stores/tenant';
import { useAuth } from './useAuth';

export function useTenantPermissions() {
  const tenantStore = useTenantStore();
  const { user } = useAuth();

  const userRoles = ref<any[]>([]);
  const userPermissions = ref<any[]>([]);
  const loading = ref(false);

  // Carrega as roles e permissões do usuário
  async function loadUserPermissions() {
    if (!user.value || !tenantStore.currentTenant) return;

    loading.value = true;
    try {
      // Busca as roles do usuário
      const { data: roles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select(`
          role_id,
          tenant_roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.value.id);

      if (rolesError) throw rolesError;
      userRoles.value = roles?.map(r => r.tenant_roles) || [];

      // Busca as permissões das roles
      const roleIds = userRoles.value.map(r => r.id);
      if (roleIds.length > 0) {
        const { data: permissions, error: permissionsError } = await supabase
          .from('tenant_role_permissions')
          .select(`
            permission_id,
            tenant_permissions (
              id,
              name,
              description
            )
          `)
          .in('role_id', roleIds);

        if (permissionsError) throw permissionsError;
        userPermissions.value = permissions?.map(p => p.tenant_permissions) || [];
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      loading.value = false;
    }
  }

  // Verifica se o usuário tem uma permissão específica
  async function hasPermission(permissionName: string): Promise<boolean> {
    if (!user.value || !tenantStore.currentTenant) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_tenant_permission', {
          user_id: user.value.id,
          permission_name: permissionName
        });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  // Verifica se o usuário tem uma role específica
  const hasRole = computed(() => (roleName: string) => {
    return userRoles.value.some(role => role.name === roleName);
  });

  // Adiciona uma role ao usuário
  async function assignRole(roleId: string) {
    if (!user.value) return;

    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .insert({
          user_id: user.value.id,
          role_id: roleId
        });

      if (error) throw error;
      await loadUserPermissions();
    } catch (error) {
      console.error('Erro ao atribuir role:', error);
      throw error;
    }
  }

  // Remove uma role do usuário
  async function removeRole(roleId: string) {
    if (!user.value) return;

    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('user_id', user.value.id)
        .eq('role_id', roleId);

      if (error) throw error;
      await loadUserPermissions();
    } catch (error) {
      console.error('Erro ao remover role:', error);
      throw error;
    }
  }

  return {
    userRoles,
    userPermissions,
    loading,
    loadUserPermissions,
    hasPermission,
    hasRole,
    assignRole,
    removeRole
  };
}
