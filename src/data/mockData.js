// Mock DEX data for demonstration
export const mockDEXs = [
  {
    name: 'Uniswap V3',
    logo: '🦄',
    liquidity: '2.4M',
    fee: '0.3%',
    price: '2,456.78',
    slippage: '0.12%',
    volume24h: '12.5M'
  },
  {
    name: 'SushiSwap',
    logo: '🍣',
    liquidity: '1.8M',
    fee: '0.25%',
    price: '2,455.23',
    slippage: '0.18%',
    volume24h: '8.2M'
  },
  {
    name: 'Curve',
    logo: '⚡',
    liquidity: '3.1M',
    fee: '0.04%',
    price: '2,457.12',
    slippage: '0.08%',
    volume24h: '15.7M'
  },
  {
    name: 'Balancer',
    logo: '⚖️',
    liquidity: '920K',
    fee: '0.5%',
    price: '2,454.89',
    slippage: '0.25%',
    volume24h: '4.1M'
  },
  {
    name: 'PancakeSwap',
    logo: '🥞',
    liquidity: '1.2M',
    fee: '0.25%',
    price: '2,456.45',
    slippage: '0.15%',
    volume24h: '6.8M'
  }
];

export const mockTokens = [
  { symbol: 'ETH', name: 'Ethereum', price: 2456.78, change: '+2.4%' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: '+0.01%' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 42156.89, change: '+1.8%' },
  { symbol: 'DAI', name: 'Dai Stablecoin', price: 0.999, change: '-0.02%' },
  { symbol: 'USDT', name: 'Tether', price: 1.001, change: '+0.03%' }
];

export const mockChartData = [
  { name: 'Jan', volume: 4000, liquidity: 2400, slippage: 0.12 },
  { name: 'Feb', volume: 3000, liquidity: 1398, slippage: 0.15 },
  { name: 'Mar', volume: 2000, liquidity: 9800, slippage: 0.08 },
  { name: 'Apr', volume: 2780, liquidity: 3908, slippage: 0.18 },
  { name: 'May', volume: 1890, liquidity: 4800, slippage: 0.22 },
  { name: 'Jun', volume: 2390, liquidity: 3800, slippage: 0.14 },
  { name: 'Jul', volume: 3490, liquidity: 4300, slippage: 0.10 }
];

export const mockTradeHistory = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30',
    from: 'ETH',
    to: 'USDC',
    amount: '1.5',
    price: '2,456.78',
    slippage: '0.12%',
    fees: '$3.45',
    dex: 'Uniswap V3'
  },
  {
    id: '2',
    timestamp: '2024-01-15 12:15',
    from: 'USDC',
    to: 'WBTC',
    amount: '5000',
    price: '42,156.89',
    slippage: '0.08%',
    fees: '$2.87',
    dex: 'Curve'
  },
  {
    id: '3',
    timestamp: '2024-01-14 16:45',
    from: 'DAI',
    to: 'ETH',
    amount: '2500',
    price: '2,455.23',
    slippage: '0.18%',
    fees: '$4.12',
    dex: 'SushiSwap'
  }
];