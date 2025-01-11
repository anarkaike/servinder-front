import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Role extends BaseEntity {
  name = 'Role'
  tableName = 'roles'
  
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
      name: 'Permitir leitura pública dos papéis',
      action: 'select',
      using: 'true'
    }
  ]
}

export class UserRole extends BaseEntity {
  name = 'UserRole'
  tableName = 'user_roles'
  
  columns = {
    user_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    role_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'roles',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver seus próprios papéis',
      action: 'select',
      using: 'auth.uid() = user_id'
    }
  ]
}
