import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class AccountVault extends BaseEntity {
  name = 'AccountVault'
  tableName = 'account_vaults'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    name: {
      type: 'text' as ColumnType
    },
    type: {
      type: 'text' as ColumnType // 'cash', 'bank_account'
    },
    balance: {
      type: 'float' as ColumnType,
      default: '0'
    },
    owner_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    bank_info: {
      type: 'jsonb' as ColumnType,
      nullable: true
    },
    status: {
      type: 'text' as ColumnType,
      default: "'active'"
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver suas próprias contas',
      action: 'select',
      using: 'auth.uid() = owner_id'
    },
    {
      name: 'Usuários podem criar suas próprias contas',
      action: 'insert',
      check: 'auth.uid() = owner_id'
    },
    {
      name: 'Usuários podem atualizar suas próprias contas',
      action: 'update',
      using: 'auth.uid() = owner_id',
      check: 'auth.uid() = owner_id'
    },
    {
      name: 'Usuários podem deletar suas próprias contas',
      action: 'delete',
      using: 'auth.uid() = owner_id'
    }
  ]
}
