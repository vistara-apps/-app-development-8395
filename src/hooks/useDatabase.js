import { useState, useEffect, useCallback } from 'react'
// import { useAccount } from 'wagmi' // Temporarily disabled for build compatibility
import DatabaseService from '../services/database'
import { SUBSCRIPTION_LIMITS } from '../lib/supabase'

/**
 * Custom hook for database operations with user context
 */
export function useDatabase() {
  // const { address } = useAccount() // Temporarily disabled for build compatibility
  const address = null // Mock address for build compatibility
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize user on wallet connection
  useEffect(() => {
    if (address) {
      initializeUser(address)
    } else {
      setUser(null)
    }
  }, [address])

  const initializeUser = async (walletAddress) => {
    setLoading(true)
    setError(null)

    try {
      // Try to get existing user
      const userResult = await DatabaseService.getUser(walletAddress)
      
      if (userResult.success) {
        setUser(userResult.data)
      } else {
        // Create new user if doesn't exist
        const createResult = await DatabaseService.createUser({
          userId: walletAddress,
          walletAddress: walletAddress
        })
        
        if (createResult.success) {
          setUser(createResult.data)
        } else {
          throw new Error(createResult.error)
        }
      }
    } catch (err) {
      setError(err.message)
      console.error('Error initializing user:', err)
    } finally {
      setLoading(false)
    }
  }

  // Trade History Operations
  const saveTradeHistory = useCallback(async (tradeData) => {
    if (!user) throw new Error('User not initialized')
    
    const result = await DatabaseService.saveTradeHistory({
      ...tradeData,
      userId: user.user_id
    })
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }, [user])

  const getTradeHistory = useCallback(async (limit = 50, offset = 0) => {
    if (!user) throw new Error('User not initialized')
    
    const result = await DatabaseService.getUserTradeHistory(user.user_id, limit, offset)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }, [user])

  const getTradeAnalytics = useCallback(async (timeframe = '7d') => {
    if (!user) throw new Error('User not initialized')
    
    const result = await DatabaseService.getTradeAnalytics(user.user_id, timeframe)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }, [user])

  // Usage Tracking
  const trackApiUsage = useCallback(async (apiCall, cost = 0.001) => {
    if (!user) return // Don't track if user not initialized
    
    try {
      await DatabaseService.trackApiUsage(user.user_id, apiCall, cost)
    } catch (err) {
      console.error('Error tracking API usage:', err)
      // Don't throw error for usage tracking failures
    }
  }, [user])

  const getUsageStats = useCallback(async (timeframe = '30d') => {
    if (!user) throw new Error('User not initialized')
    
    const result = await DatabaseService.getUserUsageStats(user.user_id, timeframe)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  }, [user])

  // Subscription Management
  const updateSubscription = useCallback(async (subscriptionTier) => {
    if (!user) throw new Error('User not initialized')
    
    const result = await DatabaseService.updateUserSubscription(user.user_id, subscriptionTier)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    setUser(result.data)
    return result.data
  }, [user])

  // Check if user can perform action based on subscription limits
  const canPerformAction = useCallback(async (action) => {
    if (!user) return false
    
    const limits = SUBSCRIPTION_LIMITS[user.subscription_tier]
    if (!limits) return false
    
    // For unlimited tiers
    if (limits.dailyAnalyses === -1) return true
    
    try {
      const usageStats = await getUsageStats('24h')
      const todayUsage = usageStats.callsByType[action] || 0
      
      return todayUsage < limits.dailyAnalyses
    } catch (err) {
      console.error('Error checking usage limits:', err)
      return false
    }
  }, [user, getUsageStats])

  // Get user's subscription limits
  const getSubscriptionLimits = useCallback(() => {
    if (!user) return null
    return SUBSCRIPTION_LIMITS[user.subscription_tier]
  }, [user])

  return {
    user,
    loading,
    error,
    
    // Trade operations
    saveTradeHistory,
    getTradeHistory,
    getTradeAnalytics,
    
    // Usage tracking
    trackApiUsage,
    getUsageStats,
    
    // Subscription management
    updateSubscription,
    canPerformAction,
    getSubscriptionLimits,
    
    // Utility
    isConnected: !!user,
    subscriptionTier: user?.subscription_tier || 'free'
  }
}

export default useDatabase
