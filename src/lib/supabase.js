import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://adzzlwyoqnaltaobwaql.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkenpsd3lvcW5hbHRhb2J3YXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDA1MjYsImV4cCI6MjA4OTUxNjUyNn0.fSn_bFar7Vrcj7kViyOqvCZLxSKW3LciBo6iXulyUfY'

export const supabase = createClient(supabaseUrl, supabaseKey)
