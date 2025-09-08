import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table names
export const TABLES = {
  USERS: 'users',
  TRADE_HISTORY: 'trade_history',
  LIQUIDITY_POOLS: 'liquidity_pools',
  USER_SUBSCRIPTIONS: 'user_subscriptions'
}

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium'
}

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    dailyAnalyses: 10,
    monthlyAnalyses: 100,
    features: ['basic_routing', 'limited_analytics']
  },
  [SUBSCRIPTION_TIERS.BASIC]: {
    dailyAnalyses: 100,
    monthlyAnalyses: 1000,
    features: ['advanced_routing', 'full_analytics', 'notifications']
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    dailyAnalyses: -1, // unlimited
    monthlyAnalyses: -1, // unlimited
    features: ['advanced_routing', 'full_analytics', 'notifications', 'ai_insights', 'priority_support']
  }
}
