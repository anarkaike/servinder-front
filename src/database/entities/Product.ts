import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Product extends BaseEntity {
  name = 'Product'
  tableName = 'products'
  
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
    sku: {
      type: 'text' as ColumnType,
      nullable: true
    },
    stock: {
      type: 'integer' as ColumnType,
      default: '0'
    },
    brand: {
      type: 'text' as ColumnType,
      nullable: true
    },
    weight: {
      type: 'float' as ColumnType,
      nullable: true
    },
    dimensions: {
      type: 'jsonb' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos produtos',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem gerenciar seus próprios produtos',
      action: 'insert',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem atualizar seus próprios produtos',
      action: 'update',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()',
      check: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    },
    {
      name: 'Usuários podem deletar seus próprios produtos',
      action: 'delete',
      using: '(select owner_id from tradeables where id = tradeable_id) = auth.uid()'
    }
  ]
}
