import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Menu extends BaseEntity {
  name = 'Menu'
  tableName = 'menus'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    location_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'menu_locations',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    parent_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'menus',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    name: {
      type: 'text' as ColumnType
    },
    url: {
      type: 'text' as ColumnType,
      nullable: true
    },
    icon: {
      type: 'text' as ColumnType,
      nullable: true
    },
    order: {
      type: 'integer' as ColumnType,
      default: '0'
    },
    permission_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'permissions',
        column: 'id',
        onDelete: 'SET NULL' as OnDeleteAction
      }
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos menus',
      action: 'select',
      using: 'true'
    }
  ]
}
