# create-nextjs-dapp

A CLI tool to scaffold Next.js dApps with your preferred wallet provider and blockchain.

## Quick Start

```bash
npx create-nextjs-dapp
```

Or with options:

```bash
npx create-nextjs-dapp my-dapp --chain evm --wallet rainbowkit
```

## Features

- Interactive CLI with beautiful prompts
- Multiple blockchain support (EVM, Solana)
- Popular wallet providers pre-configured
- TypeScript + Next.js 14+ (App Router)
- Tailwind CSS styling
- Ready-to-use contract/program interaction hooks

## Supported Wallet Providers

### EVM (Ethereum, Polygon, Base, etc.)

| Provider | Description |
|----------|-------------|
| [RainbowKit](https://rainbowkit.com) | Best UX for connecting wallets (recommended) |
| [ConnectKit](https://docs.family.co/connectkit) | Beautiful, customizable wallet connection UI |
| [Privy](https://privy.io) | Email, social, and wallet login with embedded wallets |
| [Dynamic](https://dynamic.xyz) | Multi-chain auth with embedded wallets and onramps |
| [Reown](https://reown.com) | WalletConnect's official SDK (formerly Web3Modal) |
| [Thirdweb](https://thirdweb.com) | Full-stack web3 platform with embedded wallets |
| [GetPara](https://getpara.com) | Embedded wallets with MPC key management |

### Solana

| Provider | Description |
|----------|-------------|
| [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) | Standard Solana wallet connection (recommended) |
| [Privy](https://privy.io) | Email, social, and wallet login |
| [Dynamic](https://dynamic.xyz) | Multi-chain auth with embedded wallets |
| [Reown](https://reown.com) | WalletConnect for Solana |
| [Thirdweb](https://thirdweb.com) | Full-stack web3 platform |

## Usage

### Interactive Mode

```bash
npx create-nextjs-dapp
```

You'll be prompted to:
1. Enter your project name
2. Select a blockchain (EVM or Solana)
3. Choose a wallet provider

### CLI Options

```bash
npx create-nextjs-dapp [project-name] [options]

Options:
  -c, --chain <chain>      Blockchain to use (evm, solana)
  -w, --wallet <provider>  Wallet provider to use
  -y, --yes                Skip prompts and use defaults
  --git                    Initialize a git repository
  --install                Install dependencies after creation
  -h, --help               Show help message
  -v, --version            Show version number
```

### Examples

```bash
# EVM with RainbowKit
npx create-nextjs-dapp my-app --chain evm --wallet rainbowkit

# Solana with Dynamic
npx create-nextjs-dapp my-solana-app -c solana -w dynamic

# Interactive mode with project name
npx create-nextjs-dapp my-dapp

# Non-interactive with defaults
npx create-nextjs-dapp my-dapp --yes

# Create with git and install dependencies
npx create-nextjs-dapp my-dapp --git --install
```

## After Setup

1. Navigate to your project:
   ```bash
   cd my-dapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
my-dapp/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Header.tsx      # Wallet connect button
│   ├── Greeting.tsx    # Contract interaction example
│   └── ThemeToggle.tsx # Dark/light mode toggle
├── hooks/
│   └── useGreeting.ts  # Contract hook example
├── abi/
│   └── greeter.json    # Contract ABI
└── lib/
    └── utils.ts        # Utility functions
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)
