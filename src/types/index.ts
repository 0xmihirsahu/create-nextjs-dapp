import type { PackageManager } from "../helpers";

export type Chain = "evm" | "solana";

export type WalletProvider =
  | "rainbowkit"
  | "connectkit"
  | "privy"
  | "dynamic"
  | "reown"
  | "thirdweb"
  | "getpara"
  | "wallet-adapter";

export interface CLIOptions {
  projectName?: string;
  chain?: Chain;
  wallet?: WalletProvider;
  yes?: boolean;
  git?: boolean;
  install?: boolean;
  packageManager?: PackageManager;
}

export interface ProviderInfo {
  name: string;
  description: string;
  chains: Chain[];
}

export interface ChainInfo {
  name: string;
  description: string;
}

export interface EnvVarConfig {
  key: string;
  comment: string;
  instructions: string[];
}

export { type PackageManager };
