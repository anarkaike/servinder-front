import { Migration } from './Migration.js'

export class AlterAuditsUserId implements Migration {
  name = 'alter_audits_user_id'

  async up(): Promise<string> {
    return `
      -- Converter user_id para uuid
      alter table audits
        alter column user_id type uuid using user_id::uuid;

      -- Adicionar a foreign key
      alter table audits
        add constraint audits_user_id_fkey
        foreign key (user_id)
        references users(id)
        on delete set null;
    `
  }

  async down(): Promise<string> {
    return `
      -- Remover a foreign key
      alter table audits
        drop constraint if exists audits_user_id_fkey;

      -- Converter user_id de volta para text
      alter table audits
        alter column user_id type text;
    `
  }
}
