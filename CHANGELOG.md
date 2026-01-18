# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-18

### Added

- Initial release of create-nextjs-dapp
- Interactive CLI for scaffolding Next.js dApps
- Support for EVM chains (Ethereum, Polygon, Base, Arbitrum, etc.)
- Support for Solana blockchain
- Wallet provider templates:
  - **EVM:** RainbowKit, Privy, Dynamic, Reown (AppKit), Thirdweb, GetPara (Capsule)
  - **Solana:** Privy, Dynamic, Reown (AppKit), Thirdweb
- Pre-configured Next.js 14 with App Router
- TypeScript support out of the box
- Tailwind CSS with shadcn/ui components
- Example contract/program interaction components
- CLI flags for non-interactive usage (`--chain`, `--wallet`)
- `--help` and `--version` flags
