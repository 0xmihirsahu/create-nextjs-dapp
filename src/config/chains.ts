import type { Chain, ChainInfo } from "../types";

export const CHAINS: Record<Chain, ChainInfo> = {
  evm: {
    name: "Ethereum (EVM)",
    description: "Ethereum, Polygon, Base, Arbitrum, etc.",
  },
  solana: {
    name: "Solana",
    description: "Solana blockchain",
  },
};

export const DEFAULT_CHAIN: Chain = "evm";
