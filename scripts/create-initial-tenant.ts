import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createInitialTenant() {
  try {
    // Criar o tenant inicial
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Tenant Principal',
        domain: 'principal.servinder.com',
        settings: JSON.stringify({
          theme: 'light',
          features: ['all']
        })
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    console.log('Tenant criado:', tenant);

    // Atualizar o primeiro usuário para pertencer a este tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ tenant_id: tenant.id })
      .eq('email', 'anarkaike@gmail.com')
      .select()
      .single();

    if (userError) throw userError;

    console.log('Usuário atualizado:', user);

    console.log('Tenant inicial criado e usuário associado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tenant inicial:', error);
    process.exit(1);
  }
}

createInitialTenant();
