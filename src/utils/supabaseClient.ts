import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "AVISO: As chaves do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não foram encontradas nas variáveis de ambiente. " +
    "Certifique-se de configurar o arquivo .env com os dados do seu projeto Supabase para salvar e carregar as respostas."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
