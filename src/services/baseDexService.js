import axios from 'axios'
// import rpcClient from '../utils/rpcClient' // Commented out for build compatibility

/**
 * Base DEX Service - Integrates with major DEXs on Base chain
 */
export class BaseDexService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 30000 // 30 seconds
    
    // Base chain DEX configurations
    this.dexConfigs = {
      uniswapV3: {
        name: 'Uniswap V3',
        logo: '🦄',
        type: 'v3',
        factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
        quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
        router: '0x2626664c2603336E57B271c5C0b26F421741e481',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-base'
      },
      aerodrome: {
        name: 'Aerodrome',
        logo: '✈️',
        type: 'v2',
        factory: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
        router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/aerodrome-finance/aerodrome-base'
      },
      sushiswap: {
        name: 'SushiSwap',
        logo: '🍣',
        type: 'v2',
        factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
        router: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-base'
      },
      baseswap: {
        name: 'BaseSwap',
        logo: '🔵',
        type: 'v2',
        factory: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB',
        router: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
        subgraphUrl: 'https://api.thegraph.com/subgraphs/name/baseswap/baseswap-v2'
      }
    }

    // Common token addresses on Base
    this.commonTokens = {
      ETH: '0x0000000000000000000000000000000000000000',
      WETH: '0x4200000000000000000000000000000000000006',
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
    }
  }

  /**
   * Get cached data or fetch new data
   */
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    const data = await fetchFunction()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }

  /**
   * Fetch liquidity data from Uniswap V3
   */
  async getUniswapV3Liquidity(tokenA, tokenB) {
    try {
      const query = `
        query GetPools($token0: String!, $token1: String!) {
          pools(
            where: {
              or: [
                { token0: $token0, token1: $token1 },
                { token0: $token1, token1: $token0 }
              ]
            }
            orderBy: totalValueLockedUSD
            orderDirection: desc
            first: 5
          ) {
            id
            token0 { id symbol name decimals }
            token1 { id symbol name decimals }
            feeTier
            liquidity
            sqrtPrice
            tick
            totalValueLockedUSD
            volumeUSD
            txCount
          }
        }
      `

      const response = await axios.post(this.dexConfigs.uniswapV3.subgraphUrl, {
        query,
        variables: { token0: tokenA.toLowerCase(), token1: tokenB.toLowerCase() }
      })

      return response.data.data.pools.map(pool => ({
        dex: 'Uniswap V3',
        poolAddress: pool.id,
        tokenA: pool.token0,
        tokenB: pool.token1,
        liquidity: pool.totalValueLockedUSD,
        volume24h: pool.volumeUSD,
        fee: `${pool.feeTier / 10000}%`,
        price: this.calculatePriceFromSqrtPrice(pool.sqrtPrice, pool.token0.decimals, pool.token1.decimals)
      }))
    } catch (error) {
      console.error('Error fetching Uniswap V3 liquidity:', error)
      return []
    }
  }

  /**
   * Fetch liquidity data from Aerodrome
   */
  async getAerodromeLiquidity(tokenA, tokenB) {
    try {
      const query = `
        query GetPairs($token0: String!, $token1: String!) {
          pairs(
            where: {
              or: [
                { token0: $token0, token1: $token1 },
                { token0: $token1, token1: $token0 }
              ]
            }
            orderBy: reserveUSD
            orderDirection: desc
            first: 5
          ) {
            id
            token0 { id symbol name decimals }
            token1 { id symbol name decimals }
            reserve0
            reserve1
            reserveUSD
            volumeUSD
            txCount
          }
        }
      `

      const response = await axios.post(this.dexConfigs.aerodrome.subgraphUrl, {
        query,
        variables: { token0: tokenA.toLowerCase(), token1: tokenB.toLowerCase() }
      })

      return response.data.data.pairs.map(pair => ({
        dex: 'Aerodrome',
        poolAddress: pair.id,
        tokenA: pair.token0,
        tokenB: pair.token1,
        liquidity: pair.reserveUSD,
        volume24h: pair.volumeUSD,
        fee: '0.25%', // Standard Aerodrome fee
        price: this.calculateV2Price(pair.reserve0, pair.reserve1, pair.token0.decimals, pair.token1.decimals)
      }))
    } catch (error) {
      console.error('Error fetching Aerodrome liquidity:', error)
      return []
    }
  }

  /**
   * Get aggregated liquidity data from all DEXs
   */
  async getAggregatedLiquidity(tokenA, tokenB) {
    const cacheKey = `liquidity_${tokenA}_${tokenB}`
    
    return this.getCachedData(cacheKey, async () => {
      try {
        const [uniswapPools, aerodromePools] = await Promise.allSettled([
          this.getUniswapV3Liquidity(tokenA, tokenB),
          this.getAerodromeLiquidity(tokenA, tokenB)
        ])

        const allPools = []
        
        if (uniswapPools.status === 'fulfilled') {
          allPools.push(...uniswapPools.value)
        }
        
        if (aerodromePools.status === 'fulfilled') {
          allPools.push(...aerodromePools.value)
        }

        // Sort by liquidity (highest first)
        return allPools.sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity))
      } catch (error) {
        console.error('Error getting aggregated liquidity:', error)
        return []
      }
    })
  }

  /**
   * Get token price from multiple sources
   */
  async getTokenPrice(tokenAddress) {
    const cacheKey = `price_${tokenAddress}`
    
    return this.getCachedData(cacheKey, async () => {
      try {
        // Try to get price from USDC pairs first
        const usdcPairs = await this.getAggregatedLiquidity(tokenAddress, this.commonTokens.USDC)
        
        if (usdcPairs.length > 0) {
          const bestPair = usdcPairs[0]
          return parseFloat(bestPair.price)
        }

        // Fallback to ETH pairs
        const ethPairs = await this.getAggregatedLiquidity(tokenAddress, this.commonTokens.WETH)
        
        if (ethPairs.length > 0) {
          const bestPair = ethPairs[0]
          const ethPrice = await this.getETHPrice()
          return parseFloat(bestPair.price) * ethPrice
        }

        return 0
      } catch (error) {
        console.error('Error getting token price:', error)
        return 0
      }
    })
  }

  /**
   * Get ETH price in USD
   */
  async getETHPrice() {
    const cacheKey = 'eth_price'
    
    return this.getCachedData(cacheKey, async () => {
      try {
        // Get ETH/USDC price from Uniswap V3
        const ethUsdcPairs = await this.getUniswapV3Liquidity(this.commonTokens.WETH, this.commonTokens.USDC)
        
        if (ethUsdcPairs.length > 0) {
          return parseFloat(ethUsdcPairs[0].price)
        }

        // Fallback to external API
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        return response.data.ethereum.usd
      } catch (error) {
        console.error('Error getting ETH price:', error)
        return 2000 // Fallback price
      }
    })
  }

  /**
   * Calculate slippage for a trade
   */
  calculateSlippage(amountIn, amountOut, reserves, decimalsIn, decimalsOut) {
    try {
      const amountInBN = BigInt(amountIn * Math.pow(10, decimalsIn))
      const reserve0BN = BigInt(reserves.reserve0)
      const reserve1BN = BigInt(reserves.reserve1)

      // Calculate expected output without slippage
      const expectedOutput = (amountInBN * reserve1BN) / (reserve0BN + amountInBN)
      const actualOutput = BigInt(amountOut * Math.pow(10, decimalsOut))

      // Calculate slippage percentage
      const slippage = ((expectedOutput - actualOutput) * BigInt(10000)) / expectedOutput
      return Number(slippage) / 100 // Convert to percentage
    } catch (error) {
      console.error('Error calculating slippage:', error)
      return 0
    }
  }

  /**
   * Get optimal route for a trade
   */
  async getOptimalRoute(tokenIn, tokenOut, amountIn) {
    try {
      const pools = await this.getAggregatedLiquidity(tokenIn, tokenOut)
      
      if (pools.length === 0) {
        throw new Error('No liquidity pools found for this token pair')
      }

      // For now, return the pool with highest liquidity
      // In a production system, this would involve complex routing algorithms
      const bestPool = pools[0]
      
      // Calculate estimated output and slippage
      const estimatedOutput = this.calculateOutput(amountIn, bestPool)
      const estimatedSlippage = this.estimateSlippage(amountIn, bestPool)

      return {
        route: [bestPool.dex],
        estimatedOutput,
        estimatedSlippage,
        priceImpact: estimatedSlippage,
        gasEstimate: '0.001', // ETH
        pools: [bestPool]
      }
    } catch (error) {
      console.error('Error getting optimal route:', error)
      throw error
    }
  }

  /**
   * Helper methods
   */
  calculatePriceFromSqrtPrice(sqrtPriceX96, decimals0, decimals1) {
    try {
      const sqrtPrice = Number(sqrtPriceX96) / Math.pow(2, 96)
      const price = Math.pow(sqrtPrice, 2)
      const adjustedPrice = price * Math.pow(10, decimals0 - decimals1)
      return adjustedPrice.toFixed(6)
    } catch (error) {
      return '0'
    }
  }

  calculateV2Price(reserve0, reserve1, decimals0, decimals1) {
    try {
      const price = (Number(reserve1) / Math.pow(10, decimals1)) / (Number(reserve0) / Math.pow(10, decimals0))
      return price.toFixed(6)
    } catch (error) {
      return '0'
    }
  }

  calculateOutput(amountIn, pool) {
    try {
      // Simplified calculation - in production, use actual DEX math
      const price = parseFloat(pool.price)
      return (amountIn * price * 0.997).toFixed(6) // 0.3% fee
    } catch (error) {
      return '0'
    }
  }

  estimateSlippage(amountIn, pool) {
    try {
      const liquidity = parseFloat(pool.liquidity)
      const impact = (amountIn * 100) / liquidity
      return Math.min(impact * 0.1, 5).toFixed(2) + '%' // Cap at 5%
    } catch (error) {
      return '0.1%'
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Export singleton instance
export const baseDexService = new BaseDexService()
export default baseDexService
