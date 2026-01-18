import { writeFileSync } from "fs";
import { join } from "path";
import type { Chain, WalletProvider } from "../types";

/**
 * Generate .env.example with provider-specific configuration
 */
export function updateEnvExample(
  projectPath: string,
  chain: Chain,
  wallet: WalletProvider
): void {
  const envPath = join(projectPath, ".env.example");
  let envContent = "";

  const chainComment =
    chain === "evm" ? "# Contract configuration" : "# Program configuration";
  const addressVar =
    chain === "evm"
      ? "NEXT_PUBLIC_CONTRACT_ADDRESS="
      : "NEXT_PUBLIC_PROGRAM_ID=";

  switch (wallet) {
    case "rainbowkit":
    case "connectkit":
      envContent = `# WalletConnect Project ID
# 1. Go to https://cloud.walletconnect.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

${chainComment}
# Your deployed smart contract address
${addressVar}
`;
      break;
    case "wallet-adapter":
      envContent = `# Solana Configuration
# No API key required for standard wallet adapter

${chainComment}
# Your deployed program address
${addressVar}
`;
      break;
    case "privy":
      envContent = `# Privy App ID
# 1. Go to https://dashboard.privy.io
# 2. Sign up or log in
# 3. Create a new app
# 4. Copy the App ID from Settings
NEXT_PUBLIC_PRIVY_APP_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "dynamic":
      envContent = `# Dynamic Environment ID
# 1. Go to https://app.dynamic.xyz
# 2. Sign up or log in
# 3. Create a new project
# 4. Go to Developer > SDK & API Keys
# 5. Copy the Environment ID
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "reown":
      envContent = `# Reown (WalletConnect) Project ID
# 1. Go to https://cloud.reown.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the Project ID
NEXT_PUBLIC_REOWN_PROJECT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "thirdweb":
      envContent = `# Thirdweb Client ID
# 1. Go to https://thirdweb.com/dashboard
# 2. Sign up or log in
# 3. Go to Settings > API Keys
# 4. Create a new API key
# 5. Copy the Client ID
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

${chainComment}
# Your deployed ${chain === "evm" ? "smart contract" : "program"} address
${addressVar}
`;
      break;
    case "getpara":
      envContent = `# GetPara (Capsule) API Key
# 1. Go to https://developer.getpara.com
# 2. Sign up or log in
# 3. Create a new project
# 4. Copy the API Key
NEXT_PUBLIC_PARA_API_KEY=

${chainComment}
# Your deployed smart contract address
${addressVar}
`;
      break;
  }

  writeFileSync(envPath, envContent);
}
