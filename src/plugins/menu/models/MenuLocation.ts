import { BaseEntity, ColumnType, Policy } from './Entity.js'

export class MenuLocation extends BaseEntity {
  name = 'MenuLocation'
  tableName = 'menu_locations'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    name: {
      type: 'text' as ColumnType,
      unique: true
    },
    description: {
      type: 'text' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública das localizações de menu',
      action: 'select',
      using: 'true'
    }
  ]
}
