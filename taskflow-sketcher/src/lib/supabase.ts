import { createClient } from '@supabase/supabase-js';

// Hämta miljövariabler för Supabase
const supabaseUrl = 'https://ihzaajimmaytorupdyvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloemFhamltbWF5dG9ydXBkeXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzOTQzODIsImV4cCI6MjA1Njk3MDM4Mn0.yLiSEqoYMqtpLn4HHkxkHhmXzPmA3AGyungZKXgKfTI';

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
 * Konfigurerad med direkta värden:
 * - URL: https://ihzaajimmaytorupdyvc.supabase.co
 * - Anon Key: JWT-token för anonym åtkomst
 * 
 * @example
 * // Hämta uppgifter från tasks-tabellen
 * const { data, error } = await supabase
 *   .from('tasks')
 *   .select('*')
 *   .limit(100);
 */ 