import type { Chain, WalletProvider, ProviderInfo } from "../types";

export const WALLET_PROVIDERS: Record<WalletProvider, ProviderInfo> = {
  rainbowkit: {
    name: "RainbowKit",
    description: "Best UX for connecting wallets (recommended)",
    chains: ["evm"],
  },
  connectkit: {
    name: "ConnectKit",
    description: "Beautiful, customizable wallet connection UI",
    chains: ["evm"],
  },
  privy: {
    name: "Privy",
    description: "Email, social, and wallet login with embedded wallets",
    chains: ["evm", "solana"],
  },
  dynamic: {
    name: "Dynamic",
    description: "Multi-chain auth with embedded wallets and onramps",
    chains: ["evm", "solana"],
  },
  reown: {
    name: "Reown (AppKit)",
    description: "WalletConnect's official SDK (formerly Web3Modal)",
    chains: ["evm", "solana"],
  },
  thirdweb: {
    name: "Thirdweb",
    description: "Full-stack web3 development platform with embedded wallets",
    chains: ["evm", "solana"],
  },
  getpara: {
    name: "GetPara (Capsule)",
    description: "Embedded wallets with MPC key management",
    chains: ["evm"],
  },
  "wallet-adapter": {
    name: "Solana Wallet Adapter",
    description: "Standard Solana wallet connection (recommended)",
    chains: ["solana"],
  },
};

/**
 * Get wallet providers available for a specific chain
 */
export function getProvidersForChain(chain: Chain): WalletProvider[] {
  return (Object.entries(WALLET_PROVIDERS) as [WalletProvider, ProviderInfo][])
    .filter(([, info]) => info.chains.includes(chain))
    .map(([key]) => key);
}

/**
 * Get the default wallet provider for a chain
 */
export function getDefaultProvider(chain: Chain): WalletProvider {
  const providers = getProvidersForChain(chain);
  return providers[0];
}

/**
 * Check if a wallet provider supports a chain
 */
export function isProviderCompatible(wallet: WalletProvider, chain: Chain): boolean {
  return WALLET_PROVIDERS[wallet].chains.includes(chain);
}
