import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Taxonomy, Tradeable } from '../types';
import { taxonomyService } from '../services/taxonomy.service';
import { useOrganizationStore } from '../../organization/store/organization.store';

export const useTaxonomyStore = defineStore('taxonomy', () => {
  const taxonomies = ref<Taxonomy[]>([]);
  const currentType = ref<string | null>(null);
  const organizationStore = useOrganizationStore();

  const taxonomyTree = computed(() => taxonomies.value);
  const taxonomyTypes = computed(() => {
    const types = new Set(taxonomies.value.map(t => t.type));
    return Array.from(types);
  });

  async function loadTaxonomies(type?: string) {
    if (!organizationStore.currentTenant?.id) return;
    
    currentType.value = type || null;
    taxonomies.value = await taxonomyService.getTaxonomies(
      organizationStore.currentTenant.id,
      type
    );
  }

  async function createTaxonomy(taxonomyData: Partial<Taxonomy>) {
    if (!organizationStore.currentTenant?.id) return;
    
    const newTaxonomy = await taxonomyService.createTaxonomy({
      ...taxonomyData,
      tenantId: organizationStore.currentTenant.id,
    });
    
    await loadTaxonomies(currentType.value || undefined);
    return newTaxonomy;
  }

  async function linkTradeableToTaxonomy(tradeableId: string, taxonomyId: string) {
    await taxonomyService.linkTradeableToTaxonomy(tradeableId, taxonomyId);
    await loadTaxonomies(currentType.value || undefined);
  }

  return {
    taxonomies,
    taxonomyTree,
    taxonomyTypes,
    currentType,
    loadTaxonomies,
    createTaxonomy,
    linkTradeableToTaxonomy,
  };
});
