import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Service extends BaseEntity {
  name = 'Service'
  tableName = 'services'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    tradeable_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'tradeables',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    duration: {
      type: 'integer' as ColumnType, // em minutos
      nullable: true
    },
    availability: {
      type: 'jsonb' as ColumnType, // horários disponíveis
      nullable: true
    },
    location_type: {
      type: 'text' as ColumnType, // 'remote', 'in_person', 'both'
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos serviços',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem gerenciar seus próprios serviços',
      action: 'insert',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem atualizar seus próprios serviços',
      action: 'update',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem deletar seus próprios serviços',
      action: 'delete',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    }
  ]
}
