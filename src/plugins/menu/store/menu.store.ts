import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Menu } from '../types';
import { menuService } from '../services/menu.service';
import { useTenantStore } from '../../organization/store/tenant.store';

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<Menu[]>([]);
  const currentLocation = ref<string | null>(null);
  const tenantStore = useTenantStore();

  const menuTree = computed(() => menus.value);

  async function loadMenus(locationId: string) {
    if (!tenantStore.currentTenant?.id) return;
    
    currentLocation.value = locationId;
    menus.value = await menuService.getMenusByLocation(
      locationId,
      tenantStore.currentTenant.id
    );
  }

  async function addMenu(menuData: Partial<Menu>) {
    const newMenu = await menuService.createMenu({
      ...menuData,
      tenantId: tenantStore.currentTenant?.id,
    });
    
    if (currentLocation.value) {
      await loadMenus(currentLocation.value);
    }
    
    return newMenu;
  }

  async function updateMenu(id: string, menuData: Partial<Menu>) {
    const updatedMenu = await menuService.updateMenu(id, menuData);
    
    if (currentLocation.value) {
      await loadMenus(currentLocation.value);
    }
    
    return updatedMenu;
  }

  return {
    menus,
    menuTree,
    currentLocation,
    loadMenus,
    addMenu,
    updateMenu,
  };
});
