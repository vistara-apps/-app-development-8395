import baseDexService from './baseDexService'
import DatabaseService from './database'

/**
 * Liquidity Scanner - Real-time DEX liquidity monitoring and analysis
 */
export class LiquidityScanner {
  constructor() {
    this.isScanning = false
    this.scanInterval = null
    this.subscribers = new Set()
    this.lastScanResults = new Map()
    
    // Scanning configuration
    this.config = {
      scanIntervalMs: 30000, // 30 seconds
      maxPoolsPerDex: 10,
      minLiquidityThreshold: 1000, // $1000 minimum liquidity
      priceChangeThreshold: 0.01 // 1% price change threshold for notifications
    }
  }

  /**
   * Start real-time liquidity scanning
   */
  startScanning(tokenPairs = []) {
    if (this.isScanning) {
      console.log('Liquidity scanner already running')
      return
    }

    this.isScanning = true
    console.log('Starting liquidity scanner...')

    // Initial scan
    this.performScan(tokenPairs)

    // Set up interval scanning
    this.scanInterval = setInterval(() => {
      this.performScan(tokenPairs)
    }, this.config.scanIntervalMs)
  }

  /**
   * Stop liquidity scanning
   */
  stopScanning() {
    if (!this.isScanning) return

    this.isScanning = false
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }
    console.log('Liquidity scanner stopped')
  }

  /**
   * Subscribe to liquidity updates
   */
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Perform a single scan of all configured token pairs
   */
  async performScan(tokenPairs) {
    try {
      const scanResults = new Map()
      
      for (const pair of tokenPairs) {
        const { tokenA, tokenB } = pair
        const pairKey = `${tokenA}_${tokenB}`
        
        try {
          const liquidityData = await this.scanTokenPair(tokenA, tokenB)
          scanResults.set(pairKey, {
            ...liquidityData,
            timestamp: Date.now(),
            pair: { tokenA, tokenB }
          })
        } catch (error) {
          console.error(`Error scanning pair ${pairKey}:`, error)
        }
      }

      // Update last scan results and notify subscribers
      this.updateScanResults(scanResults)
      
    } catch (error) {
      console.error('Error performing liquidity scan:', error)
    }
  }

  /**
   * Scan liquidity for a specific token pair
   */
  async scanTokenPair(tokenA, tokenB) {
    try {
      // Get aggregated liquidity from all DEXs
      const pools = await baseDexService.getAggregatedLiquidity(tokenA, tokenB)
      
      // Filter pools by minimum liquidity threshold
      const validPools = pools.filter(pool => 
        parseFloat(pool.liquidity) >= this.config.minLiquidityThreshold
      )

      // Calculate aggregate metrics
      const totalLiquidity = validPools.reduce((sum, pool) => 
        sum + parseFloat(pool.liquidity), 0
      )
      
      const totalVolume24h = validPools.reduce((sum, pool) => 
        sum + parseFloat(pool.volume24h || 0), 0
      )

      const averageSlippage = validPools.length > 0 
        ? validPools.reduce((sum, pool) => 
            sum + parseFloat(pool.estimatedSlippage || 0), 0
          ) / validPools.length
        : 0

      // Find best pool (highest liquidity)
      const bestPool = validPools[0]
      
      // Calculate price impact for different trade sizes
      const priceImpacts = await this.calculatePriceImpacts(validPools, [100, 1000, 10000])

      return {
        pools: validPools,
        totalLiquidity,
        totalVolume24h,
        averageSlippage,
        bestPool,
        priceImpacts,
        poolCount: validPools.length,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error scanning token pair:', error)
      throw error
    }
  }

  /**
   * Calculate price impact for different trade sizes
   */
  async calculatePriceImpacts(pools, tradeSizes) {
    const impacts = {}
    
    for (const size of tradeSizes) {
      const bestPool = pools[0]
      if (bestPool) {
        const impact = this.estimatePriceImpact(size, bestPool)
        impacts[`$${size}`] = impact
      }
    }
    
    return impacts
  }

  /**
   * Estimate price impact for a trade size
   */
  estimatePriceImpact(tradeSize, pool) {
    try {
      const liquidity = parseFloat(pool.liquidity)
      if (liquidity === 0) return '0%'
      
      // Simplified price impact calculation
      // In production, this would use actual AMM math
      const impact = (tradeSize / liquidity) * 100
      return Math.min(impact, 50).toFixed(2) + '%' // Cap at 50%
    } catch (error) {
      return '0%'
    }
  }

  /**
   * Update scan results and notify subscribers
   */
  updateScanResults(newResults) {
    const notifications = []
    
    // Compare with previous results to detect significant changes
    for (const [pairKey, newData] of newResults) {
      const oldData = this.lastScanResults.get(pairKey)
      
      if (oldData) {
        const priceChange = this.calculatePriceChange(oldData, newData)
        const liquidityChange = this.calculateLiquidityChange(oldData, newData)
        
        // Check for significant changes
        if (Math.abs(priceChange) >= this.config.priceChangeThreshold) {
          notifications.push({
            type: 'price_change',
            pair: newData.pair,
            change: priceChange,
            newPrice: newData.bestPool?.price,
            oldPrice: oldData.bestPool?.price
          })
        }
        
        if (Math.abs(liquidityChange) >= 0.1) { // 10% liquidity change
          notifications.push({
            type: 'liquidity_change',
            pair: newData.pair,
            change: liquidityChange,
            newLiquidity: newData.totalLiquidity,
            oldLiquidity: oldData.totalLiquidity
          })
        }
      }
    }

    // Update stored results
    this.lastScanResults = newResults

    // Notify all subscribers
    this.notifySubscribers({
      results: Object.fromEntries(newResults),
      notifications,
      timestamp: Date.now()
    })

    // Save to database for analytics
    this.saveScanResults(newResults)
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChange(oldData, newData) {
    try {
      const oldPrice = parseFloat(oldData.bestPool?.price || 0)
      const newPrice = parseFloat(newData.bestPool?.price || 0)
      
      if (oldPrice === 0) return 0
      
      return ((newPrice - oldPrice) / oldPrice) * 100
    } catch (error) {
      return 0
    }
  }

  /**
   * Calculate liquidity change percentage
   */
  calculateLiquidityChange(oldData, newData) {
    try {
      const oldLiquidity = oldData.totalLiquidity || 0
      const newLiquidity = newData.totalLiquidity || 0
      
      if (oldLiquidity === 0) return 0
      
      return ((newLiquidity - oldLiquidity) / oldLiquidity) * 100
    } catch (error) {
      return 0
    }
  }

  /**
   * Notify all subscribers of updates
   */
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  /**
   * Save scan results to database for analytics
   */
  async saveScanResults(results) {
    try {
      for (const [pairKey, data] of results) {
        // Save each pool's data
        for (const pool of data.pools) {
          await DatabaseService.updateLiquidityPool({
            poolId: pool.poolAddress,
            dexName: pool.dex,
            tokenA: data.pair.tokenA,
            tokenB: data.pair.tokenB,
            reserveA: pool.reserve0 || '0',
            reserveB: pool.reserve1 || '0',
            liquidity: pool.liquidity.toString(),
            timestamp: data.timestamp
          })
        }
      }
    } catch (error) {
      console.error('Error saving scan results to database:', error)
    }
  }

  /**
   * Get current scan results
   */
  getCurrentResults() {
    return Object.fromEntries(this.lastScanResults)
  }

  /**
   * Get liquidity summary for a token pair
   */
  async getLiquiditySummary(tokenA, tokenB) {
    const pairKey = `${tokenA}_${tokenB}`
    const cached = this.lastScanResults.get(pairKey)
    
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached
    }
    
    // Perform fresh scan if no recent data
    return await this.scanTokenPair(tokenA, tokenB)
  }

  /**
   * Find best route across all scanned pairs
   */
  findBestRoute(tokenIn, tokenOut, amount) {
    const directPair = this.lastScanResults.get(`${tokenIn}_${tokenOut}`) || 
                      this.lastScanResults.get(`${tokenOut}_${tokenIn}`)
    
    if (directPair && directPair.bestPool) {
      return {
        route: 'direct',
        pools: [directPair.bestPool],
        estimatedOutput: baseDexService.calculateOutput(amount, directPair.bestPool),
        estimatedSlippage: baseDexService.estimateSlippage(amount, directPair.bestPool),
        totalLiquidity: directPair.totalLiquidity
      }
    }
    
    // TODO: Implement multi-hop routing
    return null
  }

  /**
   * Get scanning status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      subscriberCount: this.subscribers.size,
      lastScanCount: this.lastScanResults.size,
      config: this.config
    }
  }
}

// Export singleton instance
export const liquidityScanner = new LiquidityScanner()
export default liquidityScanner
