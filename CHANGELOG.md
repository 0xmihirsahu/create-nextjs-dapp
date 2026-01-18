# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-18

### Highlights

First public release of `create-nextjs-dapp` - a production-ready CLI tool for scaffolding Next.js dApps with wallet integration.

### Features

#### Core
- Interactive CLI with [@clack/prompts](https://github.com/natemoo-re/clack) for beautiful terminal UX
- Non-interactive mode with `--yes` flag for CI/CD pipelines
- Automatic update notifications via [update-notifier](https://github.com/yeoman/update-notifier)

#### Blockchain Support
- **EVM chains** - Ethereum, Polygon, Base, Arbitrum, Optimism, and all EVM-compatible networks
- **Solana** - Full Solana blockchain support with native wallet adapters

#### Wallet Providers
- **EVM:** RainbowKit, ConnectKit, Privy, Dynamic, Reown (AppKit), Thirdweb, GetPara (Capsule)
- **Solana:** Solana Wallet Adapter, Privy, Dynamic, Reown (AppKit), Thirdweb

#### Template Stack
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Tailwind CSS
- Pre-configured wallet connection components
- Example contract/program interaction hooks

#### CLI Options
- `-c, --chain <chain>` - Select blockchain (evm, solana)
- `-w, --wallet <provider>` - Select wallet provider
- `-y, --yes` - Skip prompts, use defaults
- `--git` - Initialize git repository with initial commit
- `--install` - Install dependencies after scaffolding
- `--use-npm`, `--use-yarn`, `--use-pnpm`, `--use-bun` - Override package manager

#### Developer Experience
- Package manager auto-detection (npm, yarn, pnpm, bun)
- Project name validation using npm naming rules
- Directory conflict detection with interactive overwrite prompt
- Write permission validation before scaffolding
- Graceful error handling with helpful messages
- Modular architecture inspired by [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)

### Technical Details

- ESM-only package (`"type": "module"`)
- Built with [tsup](https://github.com/egoist/tsup) for fast bundling
- Node.js 18+ required
- Zero runtime dependencies in generated projects (beyond wallet SDK)

---

[0.1.0]: https://github.com/0xmihirsahu/create-nextjs-dapp/releases/tag/v0.1.0
