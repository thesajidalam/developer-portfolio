import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

let adminClient: SupabaseClient | null = null

/**
 * Server-only client using the SUPABASE_SERVICE_KEY.
 * Supabase's service_role role bypasses RLS, so this is used for all data
 * access inside the Next.js server (API routes, server components, seed).
 * NEVER import this into client components.
 */
export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient
  const u = requireEnv('NEXT_PUBLIC_SUPABASE_URL', url)
  const k = requireEnv('SUPABASE_SERVICE_KEY', serviceKey)
  adminClient = createClient(u, k, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}

/**
 * Public/anon client. Intended only for the rare fully-public reads when an
 * anon client could be shipped to the browser. Kept separate from the admin
 * client so the service key is never bundled on the client.
 */
export function getPublicClient(): SupabaseClient {
  const u = requireEnv('NEXT_PUBLIC_SUPABASE_URL', url)
  const k = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey)
  return createClient(u, k, { auth: { persistSession: false } })
}
