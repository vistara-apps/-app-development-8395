import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

// Mock DEX data for demonstration
export const mockDexData = {
  liquidity: [
    { dex: 'Uniswap V3', pair: 'ETH/USDC', liquidity: '$2.4M', change24h: 2.3 },
    { dex: 'SushiSwap', pair: 'ETH/USDC', liquidity: '$1.8M', change24h: -1.2 },
    { dex: 'Curve', pair: 'ETH/USDC', liquidity: '$1.2M', change24h: 0.8 },
    { dex: 'Balancer', pair: 'ETH/USDC', liquidity: '$890K', change24h: 1.5 }
  ],
  
  routes: {
    'ETH/USDC': {
      bestPrice: '1847.23',
      estimatedSlippage: '0.12%',
      totalFees: '$2.45',
      route: ['Uniswap V3', 'SushiSwap', 'Curve'],
      savings: '$12.30'
    }
  }
};

export async function fetchLiquidityData(tokenPair) {
  // In a real app, this would fetch from actual DEX APIs
  return mockDexData.liquidity;
}

export async function calculateOptimalRoute(tokenFrom, tokenTo, amount) {
  // In a real app, this would calculate the best route across DEXs
  return mockDexData.routes[`${tokenFrom}/${tokenTo}`] || mockDexData.routes['ETH/USDC'];
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