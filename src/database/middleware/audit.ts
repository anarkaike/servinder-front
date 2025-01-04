import { SupabaseClient } from '@supabase/supabase-js'

export interface AuditEvent {
  user_id?: string
  event: 'created' | 'updated' | 'deleted' | 'restored'
  auditable_type: string
  auditable_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  url?: string
  ip_address?: string
  user_agent?: string
  tags?: Record<string, any>
}

export class AuditMiddleware {
  constructor(private supabase: SupabaseClient) {}

  async logAudit(event: AuditEvent) {
    try {
      const { error } = await this.supabase
        .from('audits')
        .insert([event])

      if (error) {
        console.error('Error logging audit:', error)
      }
    } catch (error) {
      console.error('Error logging audit:', error)
    }
  }

  async getAudits(options: {
    auditable_type?: string
    auditable_id?: string
    user_id?: string
    event?: string
    from_date?: Date
    to_date?: Date
    tags?: Record<string, any>
  }) {
    let query = this.supabase
      .from('audits')
      .select('*')

    if (options.auditable_type) {
      query = query.eq('auditable_type', options.auditable_type)
    }

    if (options.auditable_id) {
      query = query.eq('auditable_id', options.auditable_id)
    }

    if (options.user_id) {
      query = query.eq('user_id', options.user_id)
    }

    if (options.event) {
      query = query.eq('event', options.event)
    }

    if (options.from_date) {
      query = query.gte('created_at', options.from_date.toISOString())
    }

    if (options.to_date) {
      query = query.lte('created_at', options.to_date.toISOString())
    }

    if (options.tags) {
      query = query.contains('tags', options.tags)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  async getAuditableHistory(type: string, id: string) {
    return this.getAudits({
      auditable_type: type,
      auditable_id: id
    })
  }

  async getUserHistory(userId: string) {
    return this.getAudits({
      user_id: userId
    })
  }
}

// Função para criar triggers de auditoria no banco de dados
export async function createAuditTriggers(supabase: SupabaseClient, table: string) {
  const functionName = `${table}_audit_trigger_func`
  const triggerName = `${table}_audit_trigger`

  // Função que será executada pelo trigger
  const createFunction = `
    CREATE OR REPLACE FUNCTION ${functionName}()
    RETURNS trigger AS $$
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        INSERT INTO audits (
          user_id,
          event,
          auditable_type,
          auditable_id,
          old_values,
          url,
          ip_address,
          user_agent
        )
        VALUES (
          auth.uid(),
          'deleted',
          '${table}',
          OLD.id,
          row_to_json(OLD),
          current_setting('request.url', true),
          current_setting('request.ip', true),
          current_setting('request.user_agent', true)
        );
        RETURN OLD;
      ELSIF (TG_OP = 'UPDATE') THEN
        -- Não registrar se apenas os campos de timestamp foram atualizados
        IF (NEW.* IS NOT DISTINCT FROM OLD.*) THEN
          RETURN NEW;
        END IF;
        
        INSERT INTO audits (
          user_id,
          event,
          auditable_type,
          auditable_id,
          old_values,
          new_values,
          url,
          ip_address,
          user_agent
        )
        VALUES (
          auth.uid(),
          'updated',
          '${table}',
          NEW.id,
          row_to_json(OLD),
          row_to_json(NEW),
          current_setting('request.url', true),
          current_setting('request.ip', true),
          current_setting('request.user_agent', true)
        );
        RETURN NEW;
      ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audits (
          user_id,
          event,
          auditable_type,
          auditable_id,
          new_values,
          url,
          ip_address,
          user_agent
        )
        VALUES (
          auth.uid(),
          'created',
          '${table}',
          NEW.id,
          row_to_json(NEW),
          current_setting('request.url', true),
          current_setting('request.ip', true),
          current_setting('request.user_agent', true)
        );
        RETURN NEW;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  // Criar o trigger
  const createTrigger = `
    DROP TRIGGER IF EXISTS ${triggerName} ON ${table};
    CREATE TRIGGER ${triggerName}
    AFTER INSERT OR UPDATE OR DELETE ON ${table}
    FOR EACH ROW EXECUTE FUNCTION ${functionName}();
  `

  try {
    const { error: functionError } = await supabase.rpc(functionName)
    if (functionError && !functionError.message.includes('does not exist')) {
      throw functionError
    }

    const { error: triggerError } = await supabase.rpc(triggerName)
    if (triggerError && !triggerError.message.includes('does not exist')) {
      throw triggerError
    }

    console.log(`Created audit triggers for table ${table}`)
  } catch (error) {
    console.error(`Error creating audit triggers for table ${table}:`, error)
  }
}
