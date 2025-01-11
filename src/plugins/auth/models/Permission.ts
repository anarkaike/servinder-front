import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Permission extends BaseEntity {
  name = 'Permission'
  tableName = 'permissions'
  
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
      name: 'Permitir leitura pública das permissões',
      action: 'select',
      using: 'true'
    }
  ]
}

export class RolePermission extends BaseEntity {
  name = 'RolePermission'
  tableName = 'role_permissions'
  
  columns = {
    role_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'roles',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    permission_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'permissions',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver permissões de seus papéis',
      action: 'select',
      using: 'auth.uid() in (select user_id from user_roles where role_id = role_permissions.role_id)'
    }
  ]
}

export class UserPermission extends BaseEntity {
  name = 'UserPermission'
  tableName = 'user_permissions'
  
  columns = {
    user_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    permission_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'permissions',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    }
  }

  policies: Policy[] = [
    {
      name: 'Usuários podem ver suas próprias permissões',
      action: 'select',
      using: 'auth.uid() = user_id'
    }
  ]
}
