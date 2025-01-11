import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tenant, Space } from '../types';
import { organizationService } from '../services/organization.service';

export const useOrganizationStore = defineStore('organization', () => {
  const currentTenant = ref<Tenant | null>(null);
  const spaces = ref<Space[]>([]);
  
  const hasSpaces = computed(() => spaces.value.length > 0);
  const tenantSettings = computed(() => {
    if (!currentTenant.value?.settings) return {};
    return JSON.parse(currentTenant.value.settings);
  });

  async function setTenant(tenant: Tenant) {
    currentTenant.value = tenant;
    await loadSpaces();
  }

  async function loadSpaces() {
    if (!currentTenant.value?.id) return;
    spaces.value = await organizationService.getSpaces(currentTenant.value.id);
  }

  async function createSpace(spaceData: Partial<Space>) {
    if (!currentTenant.value?.id) return;
    
    const newSpace = await organizationService.createSpace({
      ...spaceData,
      tenantId: currentTenant.value.id,
    });
    
    spaces.value.push(newSpace);
    return newSpace;
  }

  async function updateSettings(settings: any) {
    if (!currentTenant.value?.id) return;
    
    const updatedTenant = await organizationService.updateTenantSettings(
      currentTenant.value.id,
      settings
    );
    
    currentTenant.value = updatedTenant;
  }

  return {
    currentTenant,
    spaces,
    hasSpaces,
    tenantSettings,
    setTenant,
    loadSpaces,
    createSpace,
    updateSettings,
  };
});
