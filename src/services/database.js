import { supabase, TABLES, SUBSCRIPTION_TIERS } from '../lib/supabase'

/**
 * Database service for managing user data, trade history, and liquidity pools
 */
export class DatabaseService {
  
  // User Management
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([{
          user_id: userData.userId,
          wallet_address: userData.walletAddress,
          subscription_tier: userData.subscriptionTier || SUBSCRIPTION_TIERS.FREE,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateUserSubscription(userId, subscriptionTier) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ subscription_tier: subscriptionTier })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating user subscription:', error)
      return { success: false, error: error.message }
    }
  }

  // Trade History Management
  static async saveTradeHistory(tradeData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRADE_HISTORY)
        .insert([{
          trade_id: tradeData.tradeId,
          user_id: tradeData.userId,
          token_in: tradeData.tokenIn,
          token_out: tradeData.tokenOut,
          amount_in: tradeData.amountIn,
          amount_out: tradeData.amountOut,
          estimated_slippage: tradeData.estimatedSlippage,
          actual_slippage: tradeData.actualSlippage,
          fees: tradeData.fees,
          routed_dexs: tradeData.routedDEXs,
          timestamp: tradeData.timestamp || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving trade history:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserTradeHistory(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRADE_HISTORY)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching trade history:', error)
      return { success: false, error: error.message }
    }
  }

  static async getTradeAnalytics(userId, timeframe = '7d') {
    try {
      const timeframeDays = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      }

      const days = timeframeDays[timeframe] || 7
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from(TABLES.TRADE_HISTORY)
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })

      if (error) throw error

      // Calculate analytics
      const analytics = {
        totalTrades: data.length,
        totalVolume: data.reduce((sum, trade) => sum + parseFloat(trade.amount_in || 0), 0),
        averageSlippage: data.length > 0 
          ? data.reduce((sum, trade) => sum + parseFloat(trade.actual_slippage || 0), 0) / data.length 
          : 0,
        totalFees: data.reduce((sum, trade) => sum + parseFloat(trade.fees || 0), 0),
        dexBreakdown: this.calculateDexBreakdown(data),
        slippageHistory: this.calculateSlippageHistory(data)
      }

      return { success: true, data: analytics }
    } catch (error) {
      console.error('Error fetching trade analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Liquidity Pool Management
  static async updateLiquidityPool(poolData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.LIQUIDITY_POOLS)
        .upsert([{
          pool_id: poolData.poolId,
          dex_name: poolData.dexName,
          token_a: poolData.tokenA,
          token_b: poolData.tokenB,
          reserve_a: poolData.reserveA,
          reserve_b: poolData.reserveB,
          liquidity: poolData.liquidity,
          timestamp: poolData.timestamp || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating liquidity pool:', error)
      return { success: false, error: error.message }
    }
  }

  static async getLiquidityPools(tokenPair, limit = 20) {
    try {
      const [tokenA, tokenB] = tokenPair.split('/')
      
      const { data, error } = await supabase
        .from(TABLES.LIQUIDITY_POOLS)
        .select('*')
        .or(`and(token_a.eq.${tokenA},token_b.eq.${tokenB}),and(token_a.eq.${tokenB},token_b.eq.${tokenA})`)
        .order('liquidity', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching liquidity pools:', error)
      return { success: false, error: error.message }
    }
  }

  // Usage Tracking
  static async trackApiUsage(userId, apiCall, cost = 0.001) {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .insert([{
          user_id: userId,
          api_call: apiCall,
          cost: cost,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error tracking API usage:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserUsageStats(userId, timeframe = '30d') {
    try {
      const timeframeDays = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      }

      const days = timeframeDays[timeframe] || 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())

      if (error) throw error

      const stats = {
        totalCalls: data.length,
        totalCost: data.reduce((sum, usage) => sum + parseFloat(usage.cost || 0), 0),
        callsByType: data.reduce((acc, usage) => {
          acc[usage.api_call] = (acc[usage.api_call] || 0) + 1
          return acc
        }, {})
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper methods
  static calculateDexBreakdown(trades) {
    return trades.reduce((acc, trade) => {
      if (trade.routed_dexs && Array.isArray(trade.routed_dexs)) {
        trade.routed_dexs.forEach(dex => {
          acc[dex] = (acc[dex] || 0) + 1
        })
      }
      return acc
    }, {})
  }

  static calculateSlippageHistory(trades) {
    return trades.map(trade => ({
      timestamp: trade.timestamp,
      slippage: parseFloat(trade.actual_slippage || 0),
      volume: parseFloat(trade.amount_in || 0)
    }))
  }
}

export default DatabaseService
