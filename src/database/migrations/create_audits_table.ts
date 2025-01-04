import { Migration } from './Migration.js'

export class CreateAuditsTable implements Migration {
  name = 'create_audits_table'

  async up(): Promise<string> {
    return `
      create table if not exists audits (
        id uuid primary key default gen_random_uuid(),
        user_id text, -- Será alterado para uuid depois que a tabela users for criada
        event text not null,
        auditable_type text not null,
        auditable_id uuid not null,
        old_values jsonb,
        new_values jsonb,
        url text,
        ip_address text,
        user_agent text,
        tags jsonb,
        created_at timestamp with time zone default now()
      );

      create index audits_user_id_idx on audits(user_id);
      create index audits_auditable_type_idx on audits(auditable_type);
      create index audits_auditable_id_idx on audits(auditable_id);
      create index audits_created_at_idx on audits(created_at);
    `
  }

  async down(): Promise<string> {
    return `
      drop table if exists audits cascade;
    `
  }
}
