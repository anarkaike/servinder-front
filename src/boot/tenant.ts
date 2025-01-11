import { boot } from 'quasar/wrappers';
import { tenantMiddleware } from '@/database/middleware/TenantMiddleware';

export default boot(async () => {
  // Configura o tenant baseado no usuário logado
  await tenantMiddleware.setTenantFromUser();
});
