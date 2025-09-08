import { createPublicClient, http, formatUnits, parseUnits } from 'viem'
import { base } from 'viem/chains'

/**
 * RPC Client for Base chain interactions
 */
class RPCClient {
  constructor() {
    this.client = createPublicClient({
      chain: base,
      transport: http(import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org')
    })
    
    this.alchemyClient = import.meta.env.VITE_ALCHEMY_API_KEY 
      ? createPublicClient({
          chain: base,
          transport: http(`https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`)
        })
      : this.client
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(tokenAddress, walletAddress) {
    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // ETH balance
        const balance = await this.client.getBalance({ address: walletAddress })
        return formatUnits(balance, 18)
      } else {
        // ERC20 token balance
        const balance = await this.client.readContract({
          address: tokenAddress,
          abi: [
            {
              name: 'balanceOf',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'account', type: 'address' }],
              outputs: [{ name: '', type: 'uint256' }]
            },
            {
              name: 'decimals',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint8' }]
            }
          ],
          functionName: 'balanceOf',
          args: [walletAddress]
        })

        const decimals = await this.client.readContract({
          address: tokenAddress,
          abi: [
            {
              name: 'decimals',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint8' }]
            }
          ],
          functionName: 'decimals'
        })

        return formatUnits(balance, decimals)
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
      throw error
    }
  }

  /**
   * Get token metadata (name, symbol, decimals)
   */
  async getTokenMetadata(tokenAddress) {
    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        return {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        }
      }

      const [name, symbol, decimals] = await Promise.all([
        this.client.readContract({
          address: tokenAddress,
          abi: [
            {
              name: 'name',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'string' }]
            }
          ],
          functionName: 'name'
        }),
        this.client.readContract({
          address: tokenAddress,
          abi: [
            {
              name: 'symbol',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'string' }]
            }
          ],
          functionName: 'symbol'
        }),
        this.client.readContract({
          address: tokenAddress,
          abi: [
            {
              name: 'decimals',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint8' }]
            }
          ],
          functionName: 'decimals'
        })
      ])

      return { name, symbol, decimals }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      throw error
    }
  }

  /**
   * Get Uniswap V3 pool reserves
   */
  async getUniswapV3PoolData(poolAddress) {
    try {
      const poolABI = [
        {
          name: 'slot0',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [
            { name: 'sqrtPriceX96', type: 'uint160' },
            { name: 'tick', type: 'int24' },
            { name: 'observationIndex', type: 'uint16' },
            { name: 'observationCardinality', type: 'uint16' },
            { name: 'observationCardinalityNext', type: 'uint16' },
            { name: 'feeProtocol', type: 'uint8' },
            { name: 'unlocked', type: 'bool' }
          ]
        },
        {
          name: 'liquidity',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'uint128' }]
        },
        {
          name: 'token0',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'address' }]
        },
        {
          name: 'token1',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'address' }]
        }
      ]

      const [slot0, liquidity, token0, token1] = await Promise.all([
        this.client.readContract({
          address: poolAddress,
          abi: poolABI,
          functionName: 'slot0'
        }),
        this.client.readContract({
          address: poolAddress,
          abi: poolABI,
          functionName: 'liquidity'
        }),
        this.client.readContract({
          address: poolAddress,
          abi: poolABI,
          functionName: 'token0'
        }),
        this.client.readContract({
          address: poolAddress,
          abi: poolABI,
          functionName: 'token1'
        })
      ])

      return {
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        liquidity,
        token0,
        token1
      }
    } catch (error) {
      console.error('Error fetching Uniswap V3 pool data:', error)
      throw error
    }
  }

  /**
   * Get Uniswap V2 style pool reserves
   */
  async getUniswapV2PoolReserves(poolAddress) {
    try {
      const pairABI = [
        {
          name: 'getReserves',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [
            { name: 'reserve0', type: 'uint112' },
            { name: 'reserve1', type: 'uint112' },
            { name: 'blockTimestampLast', type: 'uint32' }
          ]
        },
        {
          name: 'token0',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'address' }]
        },
        {
          name: 'token1',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'address' }]
        }
      ]

      const [reserves, token0, token1] = await Promise.all([
        this.client.readContract({
          address: poolAddress,
          abi: pairABI,
          functionName: 'getReserves'
        }),
        this.client.readContract({
          address: poolAddress,
          abi: pairABI,
          functionName: 'token0'
        }),
        this.client.readContract({
          address: poolAddress,
          abi: pairABI,
          functionName: 'token1'
        })
      ])

      return {
        reserve0: reserves[0],
        reserve1: reserves[1],
        blockTimestampLast: reserves[2],
        token0,
        token1
      }
    } catch (error) {
      console.error('Error fetching Uniswap V2 pool reserves:', error)
      throw error
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber() {
    try {
      return await this.client.getBlockNumber()
    } catch (error) {
      console.error('Error fetching block number:', error)
      throw error
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      return await this.client.getTransactionReceipt({ hash: txHash })
    } catch (error) {
      console.error('Error fetching transaction receipt:', error)
      throw error
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction) {
    try {
      return await this.client.estimateGas(transaction)
    } catch (error) {
      console.error('Error estimating gas:', error)
      throw error
    }
  }
}

// Export singleton instance
export const rpcClient = new RPCClient()
export default rpcClient
