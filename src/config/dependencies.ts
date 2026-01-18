import type { Chain, WalletProvider } from "../types";

/**
 * Centralized dependency versions
 * Update versions here when upgrading dependencies
 */
export const VERSIONS = {
  // EVM Base
  wagmi: "^2.19.5",
  viem: "^2.44.4",

  // Solana Base
  "@solana/web3.js": "^1.98.0",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@solana/wallet-adapter-wallets": "^0.19.32",

  // Wallet Providers
  "@rainbow-me/rainbowkit": "^2.2.10",
  connectkit: "^1.8.2",
  "@privy-io/react-auth": "^2.4.1",
  "@privy-io/wagmi": "^1.0.2",
  "@dynamic-labs/ethereum": "^4.0.0",
  "@dynamic-labs/solana": "^4.0.0",
  "@dynamic-labs/sdk-react-core": "^4.0.0",
  "@dynamic-labs/wagmi-connector": "^4.0.0",
  "@reown/appkit": "^1.6.1",
  "@reown/appkit-adapter-wagmi": "^1.6.1",
  "@reown/appkit-adapter-solana": "^1.6.1",
  thirdweb: "^5.80.0",
  "@getpara/react-sdk": "^2.0.0",
} as const;

/**
 * All wallet-related dependencies that should be removed before adding new ones
 */
export const ALL_WALLET_DEPS = [
  // EVM
  "@rainbow-me/rainbowkit",
  "@privy-io/react-auth",
  "@privy-io/wagmi",
  "@dynamic-labs/ethereum",
  "@dynamic-labs/sdk-react-core",
  "@dynamic-labs/wagmi-connector",
  "@reown/appkit",
  "@reown/appkit-adapter-wagmi",
  "thirdweb",
  "@getpara/react-sdk",
  "connectkit",
  "wagmi",
  "viem",
  // Solana
  "@dynamic-labs/solana",
  "@reown/appkit-adapter-solana",
  "@solana/web3.js",
  "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-react-ui",
  "@solana/wallet-adapter-wallets",
];

/**
 * Get base dependencies for a chain
 */
export function getChainDependencies(chain: Chain): Record<string, string> {
  if (chain === "evm") {
    return {
      wagmi: VERSIONS.wagmi,
      viem: VERSIONS.viem,
    };
  }

  if (chain === "solana") {
    return {
      "@solana/web3.js": VERSIONS["@solana/web3.js"],
      "@solana/wallet-adapter-react": VERSIONS["@solana/wallet-adapter-react"],
      "@solana/wallet-adapter-react-ui": VERSIONS["@solana/wallet-adapter-react-ui"],
      "@solana/wallet-adapter-wallets": VERSIONS["@solana/wallet-adapter-wallets"],
    };
  }

  return {};
}

/**
 * Get wallet-specific dependencies
 */
export function getWalletDependencies(
  chain: Chain,
  wallet: WalletProvider
): Record<string, string> {
  // EVM wallets
  if (chain === "evm") {
    switch (wallet) {
      case "rainbowkit":
        return { "@rainbow-me/rainbowkit": VERSIONS["@rainbow-me/rainbowkit"] };
      case "connectkit":
        return { connectkit: VERSIONS.connectkit };
      case "privy":
        return {
          "@privy-io/react-auth": VERSIONS["@privy-io/react-auth"],
          "@privy-io/wagmi": VERSIONS["@privy-io/wagmi"],
        };
      case "dynamic":
        return {
          "@dynamic-labs/ethereum": VERSIONS["@dynamic-labs/ethereum"],
          "@dynamic-labs/sdk-react-core": VERSIONS["@dynamic-labs/sdk-react-core"],
          "@dynamic-labs/wagmi-connector": VERSIONS["@dynamic-labs/wagmi-connector"],
        };
      case "reown":
        return {
          "@reown/appkit": VERSIONS["@reown/appkit"],
          "@reown/appkit-adapter-wagmi": VERSIONS["@reown/appkit-adapter-wagmi"],
        };
      case "thirdweb":
        return { thirdweb: VERSIONS.thirdweb };
      case "getpara":
        return { "@getpara/react-sdk": VERSIONS["@getpara/react-sdk"] };
    }
  }

  // Solana wallets
  if (chain === "solana") {
    switch (wallet) {
      case "wallet-adapter":
        // Uses base Solana deps only
        return {};
      case "privy":
        return { "@privy-io/react-auth": VERSIONS["@privy-io/react-auth"] };
      case "dynamic":
        return {
          "@dynamic-labs/solana": VERSIONS["@dynamic-labs/solana"],
          "@dynamic-labs/sdk-react-core": VERSIONS["@dynamic-labs/sdk-react-core"],
        };
      case "reown":
        return {
          "@reown/appkit": VERSIONS["@reown/appkit"],
          "@reown/appkit-adapter-solana": VERSIONS["@reown/appkit-adapter-solana"],
        };
      case "thirdweb":
        return { thirdweb: VERSIONS.thirdweb };
    }
  }

  return {};
}
