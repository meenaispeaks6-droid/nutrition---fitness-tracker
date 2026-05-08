import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvibstzpzbghylqdyijc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12aWJzdHpwemJnaHlscWR5aWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQ2MDQsImV4cCI6MjA4Mjg3MDYwNH0.3wDHyLDqA7TnZZjgD6D_6rr1qb6OBlrmJyzZmm-JvkY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GEMINI_API_KEY = 'AIzaSyBlMsZbt08tbzxvr81Z1c9Xtz6B8bAs8b8';
export const SPOONACULAR_API_KEY = '90bb428f208644689a6215458e26267f';