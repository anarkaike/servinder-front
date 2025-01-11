#!/usr/bin/env node
import { Command } from 'commander';
import { TenantManager } from './tenant-manager';

const program = new Command();

program
  .name('tenant-cli')
  .description('CLI para gerenciar tenants do sistema');

program
  .command('create')
  .description('Criar um novo tenant')
  .requiredOption('-n, --name <name>', 'Nome do tenant')
  .requiredOption('-d, --domain <domain>', 'Domínio do tenant')
  .option('-s, --settings <settings>', 'Configurações do tenant em formato JSON')
  .action(async (options) => {
    try {
      const tenant = await TenantManager.createTenant({
        name: options.name,
        domain: options.domain,
        settings: options.settings ? JSON.parse(options.settings) : undefined,
      });
      console.log('Tenant criado com sucesso:', tenant);
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
    }
  });

program
  .command('assign-user')
  .description('Atribuir um usuário a um tenant')
  .requiredOption('-u, --userId <userId>', 'ID do usuário')
  .requiredOption('-t, --tenantId <tenantId>', 'ID do tenant')
  .action(async (options) => {
    try {
      const result = await TenantManager.assignUserToTenant(options.userId, options.tenantId);
      console.log('Usuário atribuído ao tenant com sucesso:', result);
    } catch (error) {
      console.error('Erro ao atribuir usuário ao tenant:', error);
    }
  });

program
  .command('list')
  .description('Listar todos os tenants')
  .action(async () => {
    try {
      const tenants = await TenantManager.listTenants();
      console.table(tenants);
    } catch (error) {
      console.error('Erro ao listar tenants:', error);
    }
  });

program.parse();
