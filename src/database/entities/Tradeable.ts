import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Tradeable extends BaseEntity {
  name = 'Tradeable'
  tableName = 'tradeables'
  auditable = true
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    owner_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    type: {
      type: 'text' as ColumnType // 'product', 'service', 'space'
    },
    name: {
      type: 'text' as ColumnType
    },
    description: {
      type: 'text' as ColumnType,
      nullable: true
    },
    price: {
      type: 'float' as ColumnType,
      nullable: true
    },
    status: {
      type: 'text' as ColumnType, // 'active', 'inactive', 'deleted'
      default: "'active'"
    },
    metadata: {
      type: 'jsonb' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos recursos',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem criar seus próprios recursos',
      action: 'insert',
      check: 'auth.uid() = owner_id'
    },
    {
      name: 'Usuários podem atualizar seus próprios recursos',
      action: 'update',
      using: 'auth.uid() = owner_id',
      check: 'auth.uid() = owner_id'
    },
    {
      name: 'Usuários podem deletar seus próprios recursos',
      action: 'delete',
      using: 'auth.uid() = owner_id'
    }
  ]
}
