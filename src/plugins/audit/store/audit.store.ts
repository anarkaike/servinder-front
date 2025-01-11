import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Audit, Entity } from '../types';
import { auditService } from '../services/audit.service';
import { useOrganizationStore } from '../../organization/store/organization.store';
import { useAuthStore } from '../../auth/store/auth.store';

export const useAuditStore = defineStore('audit', () => {
  const audits = ref<Audit[]>([]);
  const currentEntityType = ref<string | null>(null);
  const organizationStore = useOrganizationStore();
  const authStore = useAuthStore();

  const groupedAudits = computed(() => {
    const groups = new Map<string, Audit[]>();
    audits.value.forEach(audit => {
      const date = new Date(audit.createdAt).toLocaleDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)?.push(audit);
    });
    return groups;
  });

  async function loadEntityAudits(entityType: string, options: { limit?: number; offset?: number } = {}) {
    if (!organizationStore.currentTenant?.id) return;
    
    currentEntityType.value = entityType;
    audits.value = await auditService.getEntityAudits(
      organizationStore.currentTenant.id,
      entityType,
      options
    );
  }

  async function loadAuditTrail(entityId: string, options: { limit?: number; offset?: number } = {}) {
    const trail = await auditService.getAuditTrail(entityId, options);
    audits.value = trail;
  }

  async function createAudit(data: Partial<Audit>) {
    if (!organizationStore.currentTenant?.id || !authStore.user?.id) return;
    
    const auditData = {
      ...data,
      tenantId: organizationStore.currentTenant.id,
      userId: authStore.user.id,
    };
    
    const newAudit = await auditService.createAudit(auditData);
    audits.value.unshift(newAudit);
    return newAudit;
  }

  return {
    audits,
    groupedAudits,
    currentEntityType,
    loadEntityAudits,
    loadAuditTrail,
    createAudit,
  };
});
