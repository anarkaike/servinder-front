import { BaseEntity, ColumnType, Policy } from './Entity.js'

export class User extends BaseEntity {
  name = 'User'
  tableName = 'users'
  auditable = true
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    email: {
      type: 'text' as ColumnType,
      unique: true
    },
    name: {
      type: 'text' as ColumnType
    },
    avatar_url: {
      type: 'text' as ColumnType,
      nullable: true
    },
    metadata: {
      type: 'jsonb' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública dos usuários',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem inserir seus próprios dados',
      action: 'insert',
      check: 'auth.uid() = id'
    },
    {
      name: 'Usuários podem atualizar seus próprios dados',
      action: 'update',
      using: 'auth.uid() = id',
      check: 'auth.uid() = id'
    },
    {
      name: 'Usuários podem deletar seus próprios dados',
      action: 'delete',
      using: 'auth.uid() = id'
    }
  ]
}
