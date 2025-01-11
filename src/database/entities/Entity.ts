import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

export const Entity = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export type ColumnType = 'text' | 'integer' | 'float' | 'boolean' | 'uuid' | 'timestamp' | 'jsonb'

export type OnDeleteAction = 'CASCADE' | 'SET NULL' | 'RESTRICT'

export interface Column {
  type: ColumnType
  primary?: boolean
  unique?: boolean
  nullable?: boolean
  default?: string
  references?: {
    table: string
    column: string
    onDelete: OnDeleteAction
  }
}

export interface Policy {
  name: string
  action: 'select' | 'insert' | 'update' | 'delete'
  using?: string
  check?: string
}

export interface AuditColumns {
  created_at: Column
  created_by: Column
  updated_at: Column
  updated_by: Column
  deleted_at: Column
  deleted_by: Column
}

export const auditColumns: AuditColumns = {
  created_at: {
    type: 'timestamp',
    default: 'now()'
  },
  created_by: {
    type: 'uuid',
    references: {
      table: 'users',
      column: 'id',
      onDelete: 'SET NULL'
    },
    nullable: true
  },
  updated_at: {
    type: 'timestamp',
    default: 'now()'
  },
  updated_by: {
    type: 'uuid',
    references: {
      table: 'users',
      column: 'id',
      onDelete: 'SET NULL'
    },
    nullable: true
  },
  deleted_at: {
    type: 'timestamp',
    nullable: true
  },
  deleted_by: {
    type: 'uuid',
    references: {
      table: 'users',
      column: 'id',
      onDelete: 'SET NULL'
    },
    nullable: true
  }
}

export abstract class BaseEntity {
  abstract name: string
  abstract tableName: string
  abstract columns: Record<string, Column>
  abstract policies: Policy[]
  auditable = false

  getCreateTableSql(): string {
    const columnDefinitions = Object.entries(this.getColumns())
      .map(([name, column]) => {
        let definition = `${name} ${column.type}`
        if (column.primary) definition += ' primary key'
        if (column.unique) definition += ' unique'
        if (!column.nullable && !column.primary) definition += ' not null'
        if (column.default) definition += ` default ${column.default}`
        if (column.references) {
          definition += ` references ${column.references.table}(${column.references.column})`
          if (column.references.onDelete) definition += ` on delete ${column.references.onDelete}`
        }
        return definition
      })
      .join(',\n  ')

    return `
      create table if not exists ${this.tableName} (
        ${columnDefinitions}
      );
    `
  }

  protected getColumns(): Record<string, Column> {
    if (this.auditable) {
      return {
        ...this.columns,
        ...auditColumns
      }
    }
    return this.columns
  }

  getDropTableSql(): string {
    return `drop table if exists ${this.tableName} cascade;`
  }

  getPoliciesSql(): string {
    return this.policies.map(policy => {
      const using = policy.using ? `using (${policy.using})` : ''
      const check = policy.check ? `with check (${policy.check})` : ''

      return `
        create policy "${policy.name}"
          on ${this.tableName}
          for ${policy.action}
          to authenticated
          ${using}
          ${check};
      `
    }).join('\n')
  }

  getEnableRlsSql(): string {
    return `alter table ${this.tableName} enable row level security;`
  }

  getDisableRlsSql(): string {
    return `alter table ${this.tableName} disable row level security;`
  }

  getDropPoliciesSql(): string {
    return this.policies.map(policy => `
      drop policy if exists "${policy.name}" on ${this.tableName};
    `).join('\n')
  }
}
