import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Audit extends BaseEntity {
  name = 'Audit'
  tableName = 'audits'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    user_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'SET NULL' as OnDeleteAction
      }
    },
    event: {
      type: 'text' as ColumnType // 'created', 'updated', 'deleted', 'restored'
    },
    auditable_type: {
      type: 'text' as ColumnType // nome da tabela
    },
    auditable_id: {
      type: 'uuid' as ColumnType
    },
    old_values: {
      type: 'jsonb' as ColumnType,
      nullable: true
    },
    new_values: {
      type: 'jsonb' as ColumnType,
      nullable: true
    },
    url: {
      type: 'text' as ColumnType,
      nullable: true
    },
    ip_address: {
      type: 'text' as ColumnType,
      nullable: true
    },
    user_agent: {
      type: 'text' as ColumnType,
      nullable: true
    },
    tags: {
      type: 'jsonb' as ColumnType,
      nullable: true
    },
    created_at: {
      type: 'timestamp' as ColumnType,
      default: 'now()'
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver auditorias de seus próprios recursos',
      action: 'select',
      using: 'auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM tradeables WHERE id = auditable_id)'
    },
    {
      name: 'Sistema pode criar registros de auditoria',
      action: 'insert',
      using: 'true'
    }
  ]
}
