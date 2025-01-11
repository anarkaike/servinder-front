import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Space extends BaseEntity {
  name = 'Space'
  tableName = 'spaces'
  
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
    capacity: {
      type: 'integer' as ColumnType,
      nullable: true
    },
    area: {
      type: 'float' as ColumnType, // em metros quadrados
      nullable: true
    },
    address: {
      type: 'jsonb' as ColumnType,
      nullable: true
    },
    amenities: {
      type: 'jsonb' as ColumnType, // lista de comodidades
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos espaços',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem gerenciar seus próprios espaços',
      action: 'insert',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem atualizar seus próprios espaços',
      action: 'update',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem deletar seus próprios espaços',
      action: 'delete',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    }
  ]
}
