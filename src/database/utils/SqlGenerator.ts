import { Entity, Column } from '../entities/index.js'

export class SqlGenerator {
  static generateColumnDefinition(name: string, column: Column): string {
    const parts = [
      name,
      column.type,
      column.nullable ? 'null' : 'not null',
      column.unique ? 'unique' : '',
      column.primary ? 'primary key' : '',
      column.default ? `default ${column.default}` : ''
    ].filter(Boolean)

    if (column.references) {
      parts.push(`references ${column.references.table}(${column.references.column})`)
      if (column.references.onDelete) {
        parts.push(`on delete ${column.references.onDelete}`)
      }
    }

    return parts.join(' ')
  }

  static generateCreateTableSql(entity: Entity): string {
    const columnDefinitions = Object.entries(entity.columns)
      .map(([name, column]) => `  ${this.generateColumnDefinition(name, column)}`)

    if (entity.timestamps) {
      columnDefinitions.push(
        '  created_at timestamp with time zone default timezone(\'utc\'::text, now()) not null',
        '  updated_at timestamp with time zone default timezone(\'utc\'::text, now()) not null'
      )
    }

    const sql = [
      `-- Criar a tabela ${entity.tableName}`,
      `create table if not exists public.${entity.tableName} (`,
      columnDefinitions.join(',\n'),
      ');'
    ]

    if (entity.enableRls) {
      sql.push(
        '',
        `-- Habilitar RLS (Row Level Security)`,
        `alter table public.${entity.tableName} enable row level security;`
      )
    }

    // Adicionar políticas
    entity.policies.forEach(policy => {
      sql.push(
        '',
        `-- Criar política ${policy.name}`,
        `create policy "${policy.name}"`,
        `  on public.${entity.tableName}`,
        `  for ${policy.action}`
      )

      if (policy.using) {
        sql.push(`  using (${policy.using})`)
      }

      if (policy.check) {
        sql.push(`  with check (${policy.check})`)
      }

      sql[sql.length - 1] += ';'
    })

    // Adicionar trigger para updated_at se timestamps estiver habilitado
    if (entity.timestamps) {
      sql.push(
        '',
        '-- Trigger para atualizar updated_at',
        'create or replace function update_updated_at_column()',
        'returns trigger as $$',
        'begin',
        '  new.updated_at = timezone(\'utc\'::text, now());',
        '  return new;',
        'end;',
        '$$ language plpgsql;',
        '',
        `create trigger update_${entity.tableName}_updated_at`,
        `  before update on public.${entity.tableName}`,
        '  for each row',
        '  execute function update_updated_at_column();'
      )
    }

    return sql.join('\n')
  }

  static generateDropTableSql(entity: Entity): string {
    const sql = []

    if (entity.timestamps) {
      sql.push(
        `-- Remover trigger`,
        `drop trigger if exists update_${entity.tableName}_updated_at on public.${entity.tableName};`,
        'drop function if exists update_updated_at_column();',
        ''
      )
    }

    // Remover políticas
    if (entity.policies.length > 0) {
      sql.push('-- Remover políticas')
      entity.policies.forEach(policy => {
        sql.push(`drop policy if exists "${policy.name}" on public.${entity.tableName};`)
      })
      sql.push('')
    }

    sql.push(
      `-- Remover tabela`,
      `drop table if exists public.${entity.tableName};`
    )

    return sql.join('\n')
  }
}
