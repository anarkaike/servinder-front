import { BaseEntity, ColumnType, Policy, OnDeleteAction } from './Entity.js'

export class Taxonomy extends BaseEntity {
  name = 'Taxonomy'
  tableName = 'taxonomies'
  
  columns = {
    id: {
      type: 'uuid' as ColumnType,
      primary: true,
      default: 'gen_random_uuid()'
    },
    name: {
      type: 'text' as ColumnType
    },
    type: {
      type: 'text' as ColumnType // 'category', 'tag'
    },
    parent_id: {
      type: 'uuid' as ColumnType,
      nullable: true,
      references: {
        table: 'taxonomies',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    metadata: {
      type: 'jsonb' as ColumnType,
      nullable: true
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública das taxonomias',
      action: 'select',
      using: 'true'
    }
  ]
}

export class Taxonomable extends BaseEntity {
  name = 'Taxonomable'
  tableName = 'taxonomables'
  
  columns = {
    taxonomy_id: {
      type: 'uuid' as ColumnType,
      references: {
        table: 'taxonomies',
        column: 'id',
        onDelete: 'CASCADE' as OnDeleteAction
      }
    },
    taxonomable_id: {
      type: 'uuid' as ColumnType
    },
    taxonomable_type: {
      type: 'text' as ColumnType
    }
  }

  policies: Policy[] = [
    {
      name: 'Permitir leitura pública das relações de taxonomia',
      action: 'select',
      using: 'true'
    },
    {
      name: 'Usuários podem gerenciar taxonomias de seus recursos',
      action: 'insert',
      check: 'taxonomable_type = \'users\' and taxonomable_id = auth.uid() or taxonomable_type = \'tradeables\' and taxonomable_id in (select id from tradeables where owner_id = auth.uid())'
    },
    {
      name: 'Usuários podem atualizar taxonomias de seus recursos',
      action: 'update',
      using: 'taxonomable_type = \'users\' and taxonomable_id = auth.uid() or taxonomable_type = \'tradeables\' and taxonomable_id in (select id from tradeables where owner_id = auth.uid())',
      check: 'taxonomable_type = \'users\' and taxonomable_id = auth.uid() or taxonomable_type = \'tradeables\' and taxonomable_id in (select id from tradeables where owner_id = auth.uid())'
    },
    {
      name: 'Usuários podem deletar taxonomias de seus recursos',
      action: 'delete',
      using: 'taxonomable_type = \'users\' and taxonomable_id = auth.uid() or taxonomable_type = \'tradeables\' and taxonomable_id in (select id from tradeables where owner_id = auth.uid())'
    }
  ]
}
