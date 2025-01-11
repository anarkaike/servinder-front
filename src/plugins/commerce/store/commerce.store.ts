import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, Service, Movement } from '../types';
import { commerceService } from '../services/commerce.service';
import { useTenantStore } from '../../organization/store/tenant.store';

export const useCommerceStore = defineStore('commerce', () => {
  const products = ref<Product[]>([]);
  const services = ref<Service[]>([]);
  const movements = ref<Movement[]>([]);
  const tenantStore = useTenantStore();

  const totalProducts = computed(() => products.value.length);
  const totalServices = computed(() => services.value.length);

  async function loadProducts() {
    if (!tenantStore.currentTenant?.id) return;
    products.value = await commerceService.getProducts(tenantStore.currentTenant.id);
  }

  async function loadServices() {
    if (!tenantStore.currentTenant?.id) return;
    services.value = await commerceService.getServices(tenantStore.currentTenant.id);
  }

  async function createMovement(movementData: Partial<Movement>) {
    const newMovement = await commerceService.createMovement({
      ...movementData,
      tenantId: tenantStore.currentTenant?.id,
    });
    movements.value.push(newMovement);
    return newMovement;
  }

  async function getAccountBalance(accountId: string) {
    return commerceService.getAccountBalance(accountId);
  }

  return {
    products,
    services,
    movements,
    totalProducts,
    totalServices,
    loadProducts,
    loadServices,
    createMovement,
    getAccountBalance,
  };
});
