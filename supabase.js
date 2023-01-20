
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with yo ur database
export const supabase = createClient('https://luqftwbodufzkfswfpob.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cWZ0d2JvZHVmemtmc3dmcG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM1OTMyODUsImV4cCI6MTk4OTE2OTI4NX0.KkuBPUyahlb8C08L_D9_J9MqLeO4kAciFm6qdD4IjOU')
