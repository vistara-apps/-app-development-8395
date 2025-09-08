// Mock RPC Client for build compatibility
// All blockchain functionality is temporarily disabled

/**
 * Mock RPC Client for Base chain interactions
 */
class RPCClient {
  constructor() {
    // Mock implementation for build compatibility
    this.client = null;
    this.alchemyClient = null;
  }

  /**
   * Get token balance for an address (Mock implementation)
   */
  async getTokenBalance(tokenAddress, walletAddress) {
    return '1000.0';
  }

  /**
   * Get token metadata (Mock implementation)
   */
  async getTokenMetadata(tokenAddress) {
    return {
      name: 'Mock Token',
      symbol: 'MOCK',
      decimals: 18
    };
  }

  /**
   * Get token price (Mock implementation)
   */
  async getTokenPrice(tokenAddress, baseToken) {
    return {
      price: '1.0',
      priceUSD: '1.0',
      change24h: '0.05',
      volume24h: '1000000'
    };
  }

  /**
   * Get gas price (Mock implementation)
   */
  async getGasPrice() {
    return '20'; // 20 gwei
  }

  /**
   * Estimate gas (Mock implementation)
   */
  async estimateGas(transaction) {
    return '21000';
  }

  /**
   * Get block number (Mock implementation)
   */
  async getBlockNumber() {
    return 1000000;
  }

  /**
   * Get transaction receipt (Mock implementation)
   */
  async getTransactionReceipt(hash) {
    return {
      status: 'success',
      blockNumber: 1000000,
      gasUsed: '21000'
    };
  }

  /**
   * Send transaction (Mock implementation)
   */
  async sendTransaction(transaction) {
    return '0x1234567890abcdef';
  }

  /**
   * Call contract (Mock implementation)
   */
  async callContract(params) {
    return '0x';
  }

  /**
   * Get logs (Mock implementation)
   */
  async getLogs(filter) {
    return [];
  }

  /**
   * Get transaction (Mock implementation)
   */
  async getTransaction(hash) {
    return {
      hash,
      from: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
      value: '0'
    };
  }

  /**
   * Wait for transaction (Mock implementation)
   */
  async waitForTransaction(hash, confirmations = 1) {
    return this.getTransactionReceipt(hash);
  }
}

// Export singleton instance
export const rpcClient = new RPCClient()
export default rpcClient
