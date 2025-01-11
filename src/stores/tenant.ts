import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@boot/supabase';
import { Tenant } from '@database/entities/Tenant';

export const useTenantStore = defineStore('tenant', () => {
  const currentTenant = ref<Tenant | null>(null);
  const tenantSettings = ref<any>(null);
  const tenantFeatures = ref<string[]>([]);
  const tenantCache = new Map<string, any>();
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Getters
  const isMultiDatabase = computed(() => !!currentTenant.value?.database);
  const getTenantSettings = computed(() => tenantSettings.value);
  const getTenantFeatures = computed(() => tenantFeatures.value);

  // Actions
  async function setCurrentTenant(tenant: Tenant) {
    currentTenant.value = tenant;
    
    // Parse das configurações
    if (tenant.settings) {
      try {
        tenantSettings.value = JSON.parse(tenant.settings);
        tenantFeatures.value = tenantSettings.value.features || [];
      } catch (error) {
        console.error('Erro ao processar configurações do tenant:', error);
      }
    }

    // Atualiza as políticas RLS apenas em produção
    if (!isDev) {
      await updateRLSPolicies(tenant.id);
    }
  }

  async function updateTenantSettings(settings: any) {
    if (!currentTenant.value || isDev) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          settings: JSON.stringify(settings)
        })
        .eq('id', currentTenant.value.id)
        .select()
        .single();

      if (error) throw error;

      tenantSettings.value = settings;
      if (data) {
        currentTenant.value = data;
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  async function updateRLSPolicies(tenantId: string) {
    try {
      await supabase.rpc('set_tenant_context', {
        p_tenant_id: tenantId
      });
    } catch (error) {
      console.error('Erro ao atualizar políticas RLS:', error);
    }
  }

  function clearTenantCache() {
    tenantCache.clear();
  }

  async function checkFeatureEnabled(feature: string): Promise<boolean> {
    return tenantFeatures.value.includes(feature);
  }

  async function switchDatabase() {
    if (!currentTenant.value?.database) return;

    try {
      // Aqui você pode adicionar a lógica para trocar o banco de dados
      // Por exemplo, usando uma conexão pool ou alterando o schema
      console.log(`Trocando para o banco de dados: ${currentTenant.value.database}`);
    } catch (error) {
      console.error('Erro ao trocar banco de dados:', error);
      throw error;
    }
  }

  return {
    currentTenant,
    tenantSettings,
    tenantFeatures,
    isMultiDatabase,
    getTenantSettings,
    getTenantFeatures,
    setCurrentTenant,
    updateTenantSettings,
    clearTenantCache,
    checkFeatureEnabled,
    switchDatabase
  };
});
