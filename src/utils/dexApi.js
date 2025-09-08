import OpenAI from 'openai';
import baseDexService from '../services/baseDexService';
import liquidityScanner from '../services/liquidityScanner';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

// Legacy mock data for fallback
export const mockDexData = {
  liquidity: [
    { dex: 'Uniswap V3', pair: 'ETH/USDC', liquidity: '$2.4M', change24h: 2.3 },
    { dex: 'Aerodrome', pair: 'ETH/USDC', liquidity: '$1.8M', change24h: -1.2 },
    { dex: 'SushiSwap', pair: 'ETH/USDC', liquidity: '$1.2M', change24h: 0.8 },
    { dex: 'BaseSwap', pair: 'ETH/USDC', liquidity: '$890K', change24h: 1.5 }
  ],
  
  routes: {
    'ETH/USDC': {
      bestPrice: '1847.23',
      estimatedSlippage: '0.12%',
      totalFees: '$2.45',
      route: ['Uniswap V3', 'Aerodrome', 'SushiSwap'],
      savings: '$12.30'
    }
  }
};

/**
 * Fetch real liquidity data from Base DEXs
 */
export async function fetchLiquidityData(tokenPair) {
  try {
    const [tokenA, tokenB] = tokenPair.split('/');
    
    // Try to get real data from Base DEX service
    const liquidityData = await baseDexService.getAggregatedLiquidity(
      getTokenAddress(tokenA), 
      getTokenAddress(tokenB)
    );
    
    if (liquidityData && liquidityData.length > 0) {
      return liquidityData.map(pool => ({
        dex: pool.dex,
        pair: tokenPair,
        liquidity: formatLiquidity(pool.liquidity),
        change24h: Math.random() * 10 - 5, // TODO: Calculate real 24h change
        volume24h: formatLiquidity(pool.volume24h),
        fee: pool.fee,
        slippage: pool.estimatedSlippage || '0.1%'
      }));
    }
    
    // Fallback to mock data
    return mockDexData.liquidity;
  } catch (error) {
    console.error('Error fetching liquidity data:', error);
    return mockDexData.liquidity;
  }
}

/**
 * Calculate optimal route using real DEX data
 */
export async function calculateOptimalRoute(tokenFrom, tokenTo, amount) {
  try {
    const tokenFromAddress = getTokenAddress(tokenFrom);
    const tokenToAddress = getTokenAddress(tokenTo);
    
    // Get optimal route from Base DEX service
    const routeData = await baseDexService.getOptimalRoute(
      tokenFromAddress, 
      tokenToAddress, 
      parseFloat(amount)
    );
    
    if (routeData) {
      return {
        bestPrice: routeData.estimatedOutput,
        estimatedSlippage: routeData.estimatedSlippage,
        totalFees: routeData.gasEstimate,
        route: routeData.route,
        savings: calculateSavings(routeData),
        pools: routeData.pools
      };
    }
    
    // Fallback to mock data
    return mockDexData.routes[`${tokenFrom}/${tokenTo}`] || mockDexData.routes['ETH/USDC'];
  } catch (error) {
    console.error('Error calculating optimal route:', error);
    return mockDexData.routes[`${tokenFrom}/${tokenTo}`] || mockDexData.routes['ETH/USDC'];
  }
}

/**
 * Get real-time liquidity summary
 */
export async function getLiquiditySummary(tokenA, tokenB) {
  try {
    const tokenAAddress = getTokenAddress(tokenA);
    const tokenBAddress = getTokenAddress(tokenB);
    
    return await liquidityScanner.getLiquiditySummary(tokenAAddress, tokenBAddress);
  } catch (error) {
    console.error('Error getting liquidity summary:', error);
    return null;
  }
}

/**
 * Get token price from DEX data
 */
export async function getTokenPrice(tokenSymbol) {
  try {
    const tokenAddress = getTokenAddress(tokenSymbol);
    return await baseDexService.getTokenPrice(tokenAddress);
  } catch (error) {
    console.error('Error getting token price:', error);
    return 0;
  }
}

/**
 * Helper function to get token address from symbol
 */
function getTokenAddress(tokenSymbol) {
  const tokenAddresses = {
    'ETH': '0x0000000000000000000000000000000000000000',
    'WETH': '0x4200000000000000000000000000000000000006',
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'USDbC': '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    'USDT': '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  };
  
  return tokenAddresses[tokenSymbol.toUpperCase()] || tokenSymbol;
}

/**
 * Format liquidity amount for display
 */
function formatLiquidity(amount) {
  const num = parseFloat(amount);
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  } else {
    return `$${num.toFixed(0)}`;
  }
}

/**
 * Calculate savings compared to worst route
 */
function calculateSavings(routeData) {
  // Simplified calculation - in production, compare with all available routes
  const estimatedSavings = parseFloat(routeData.estimatedOutput) * 0.001; // 0.1% savings estimate
  return `$${estimatedSavings.toFixed(2)}`;
}

export async function generateTradingInsights(tradeData) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a DeFi trading expert. Analyze the provided trade data and give brief insights about slippage optimization and cost savings."
        },
        {
          role: "user",
          content: `Analyze this trade: ${JSON.stringify(tradeData)}`
        }
      ],
      max_tokens: 150
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating insights:', error);
    return "Unable to generate insights at this time.";
  }
}
