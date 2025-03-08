import { createClient } from '@supabase/supabase-js';

// Hämta miljövariabler för Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kontrollera att miljövariablerna är satta
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL eller Anon Key saknas. Kontrollera dina miljövariabler.');
}

// Skapa och exportera Supabase-klienten
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Supabase-klient för att interagera med Supabase-backend
 * 
 * Använder Repository Pattern enligt technical.md
 * Konfigurerad med miljövariabler:
 * - VITE_SUPABASE_URL: URL till Supabase-projektet
 * - VITE_SUPABASE_ANON_KEY: Anonym API-nyckel för Supabase
 * 
 * @example
 * // Hämta uppgifter från tasks-tabellen
 * const { data, error } = await supabase
 *   .from('tasks')
 *   .select('*')
 *   .limit(100);
 */ 