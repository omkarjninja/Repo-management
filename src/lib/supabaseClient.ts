import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qutednxdydmcfhvgmxyo.supabase.co'; // <-- replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dGVkbnhkeWRtY2ZodmdteHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NjMzNzMsImV4cCI6MjA2ODIzOTM3M30.TY1Aktn8uSkNEJEBRB8pFs6UafpOI2w-bqcstgJcCfk'; // <-- replace with your anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
