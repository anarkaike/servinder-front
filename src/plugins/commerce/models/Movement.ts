import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Movement extends BaseEntity {
  name = 'Movement'
  tableName = 'movements'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    type: {
      type: 'text' as ColumnType // 'transfer', 'purchase', 'sale', 'loan'
    },
    amount: {
      type: 'float' as ColumnType
    },
    from_account_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'account_vaults',
        column: 'id',
        onDelete: 'SET NULL' as OnDeleteAction
      }
    },
    to_account_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'account_vaults',
        column: 'id',
        onDelete: 'SET NULL' as OnDeleteAction
      }
    },
    tradeable_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'tradeables',
        column: 'id',
        onDelete: 'SET NULL' as OnDeleteAction
      }
    },
    status: {
      type: 'text' as ColumnType, // 'pending', 'completed', 'cancelled', 'failed'
      default: "'pending'"
    },
    metadata: {
      type: 'jsonb' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver movimentações de suas contas',
      action: 'select',
      using: '(select owner_id from account_vaults where id = from_account_id) = auth.uid() or (select owner_id from account_vaults where id = to_account_id) = auth.uid()'
    },
    {
      name: 'Usuários podem criar movimentações de suas contas',
      action: 'insert',
      check: '(select owner_id from account_vaults where id = from_account_id) = auth.uid() or (select owner_id from account_vaults where id = to_account_id) = auth.uid()'
    },
    {
      name: 'Usuários podem atualizar movimentações de suas contas',
      action: 'update',
      using: '(select owner_id from account_vaults where id = from_account_id) = auth.uid() or (select owner_id from account_vaults where id = to_account_id) = auth.uid()',
      check: '(select owner_id from account_vaults where id = from_account_id) = auth.uid() or (select owner_id from account_vaults where id = to_account_id) = auth.uid()'
    }
  ]
}
