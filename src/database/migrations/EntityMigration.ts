import { Migration } from './Migration.js'
import { BaseEntity } from '../entities/Entity.js'

export class EntityMigration implements Migration {
  constructor(private entity: BaseEntity) {}

  get name(): string {
    return `create_${this.entity.tableName}_table`
  }

  private getAuditTriggerSql(): string {
    if (!(this.entity as any).auditable) return ''

    return `
      -- Função que registra a auditoria
      CREATE OR REPLACE FUNCTION audit_${this.entity.tableName}_trigger()
      RETURNS trigger AS $$
      DECLARE
        old_row jsonb;
        new_row jsonb;
        audit_row jsonb;
      BEGIN
        IF (TG_OP = 'DELETE') THEN
          old_row = to_jsonb(OLD);
          new_row = null;
        ELSIF (TG_OP = 'UPDATE') THEN
          old_row = to_jsonb(OLD);
          new_row = to_jsonb(NEW);
        ELSE
          old_row = null;
          new_row = to_jsonb(NEW);
        END IF;

        audit_row = jsonb_build_object(
          'user_id', coalesce(current_setting('request.jwt.claims', true)::jsonb->>'sub', 'system'),
          'event', TG_OP,
          'auditable_type', TG_TABLE_NAME,
          'auditable_id', CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
          END,
          'old_values', old_row,
          'new_values', new_row,
          'url', current_setting('request.url', true),
          'ip_address', current_setting('request.headers', true)::jsonb->>'x-real-ip',
          'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
          'tags', jsonb_build_object(
            'client', current_setting('request.headers', true)::jsonb->>'x-client',
            'version', current_setting('request.headers', true)::jsonb->>'x-version'
          )
        );

        INSERT INTO audits (
          user_id,
          event,
          auditable_type,
          auditable_id,
          old_values,
          new_values,
          url,
          ip_address,
          user_agent,
          tags
        )
        VALUES (
          audit_row->>'user_id',
          audit_row->>'event',
          audit_row->>'auditable_type',
          (audit_row->>'auditable_id')::uuid,
          audit_row->'old_values',
          audit_row->'new_values',
          audit_row->>'url',
          audit_row->>'ip_address',
          audit_row->>'user_agent',
          audit_row->'tags'
        );

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Trigger para INSERT
      DROP TRIGGER IF EXISTS audit_${this.entity.tableName}_insert_trigger ON ${this.entity.tableName};
      CREATE TRIGGER audit_${this.entity.tableName}_insert_trigger
        AFTER INSERT ON ${this.entity.tableName}
        FOR EACH ROW
        EXECUTE FUNCTION audit_${this.entity.tableName}_trigger();

      -- Trigger para UPDATE
      DROP TRIGGER IF EXISTS audit_${this.entity.tableName}_update_trigger ON ${this.entity.tableName};
      CREATE TRIGGER audit_${this.entity.tableName}_update_trigger
        AFTER UPDATE ON ${this.entity.tableName}
        FOR EACH ROW
        EXECUTE FUNCTION audit_${this.entity.tableName}_trigger();

      -- Trigger para DELETE
      DROP TRIGGER IF EXISTS audit_${this.entity.tableName}_delete_trigger ON ${this.entity.tableName};
      CREATE TRIGGER audit_${this.entity.tableName}_delete_trigger
        AFTER DELETE ON ${this.entity.tableName}
        FOR EACH ROW
        EXECUTE FUNCTION audit_${this.entity.tableName}_trigger();
    `
  }

  async up(): Promise<string> {
    return `
      ${this.entity.getCreateTableSql()}
      ${this.entity.getEnableRlsSql()}
      ${this.entity.getPoliciesSql()}
      ${this.getAuditTriggerSql()}
    `
  }

  async down(): Promise<string> {
    return this.entity.getDropTableSql()
  }
}
