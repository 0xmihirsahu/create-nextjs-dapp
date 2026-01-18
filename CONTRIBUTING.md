# Contributing to create-nextjs-dapp

Thank you for your interest in contributing to create-nextjs-dapp! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Adding a New Wallet Provider](#adding-a-new-wallet-provider)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

This project follows a standard code of conduct. Please be respectful and inclusive in all interactions. We're building something useful together.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/create-nextjs-dapp.git
   cd create-nextjs-dapp
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/0xmihirsahu/create-nextjs-dapp.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Locally

```bash
# Direct execution
node dist/index.js

# Or link globally for testing
npm link
create-nextjs-dapp
```

### Run Tests

```bash
npm test
```

## Project Architecture

```
create-nextjs-dapp/
├── src/
│   ├── index.ts              # CLI entry point and main logic
│   └── helpers/              # Modular helper functions
│       ├── index.ts          # Barrel export
│       ├── get-pkg-manager.ts    # Package manager detection
│       ├── validate-pkg.ts       # Project name validation
│       ├── is-folder-empty.ts    # Directory conflict detection
│       ├── is-writeable.ts       # Write permission check
│       ├── git.ts                # Git initialization
│       ├── install.ts            # Dependency installation
│       └── copy.ts               # File copying utilities
├── templates/
│   ├── base/                 # Shared base template (Next.js, Tailwind, etc.)
│   ├── evm/                  # EVM chain templates
│   │   ├── app/              # Chain-specific app files
│   │   ├── components/       # Chain-specific components
│   │   ├── rainbowkit/       # Wallet provider overrides
│   │   ├── connectkit/
│   │   ├── privy/
│   │   ├── dynamic/
│   │   ├── reown/
│   │   ├── thirdweb/
│   │   └── getpara/
│   └── solana/               # Solana chain templates
│       ├── app/
│       ├── components/
│       ├── wallet-adapter/
│       ├── privy/
│       ├── dynamic/
│       ├── reown/
│       └── thirdweb/
├── test/
│   └── cli.test.js           # Test suite
└── dist/                     # Build output (generated)
```

### Template Layering

Templates are applied in order:
1. `templates/base/` - Core Next.js setup
2. `templates/{chain}/` - Chain-specific files (app/, components/)
3. `templates/{chain}/{wallet}/` - Wallet provider overrides

## Adding a New Wallet Provider

### For EVM

1. Create directory: `templates/evm/your-provider/`
2. Add required files:
   ```
   templates/evm/your-provider/
   ├── components/
   │   ├── Providers.tsx    # Wallet provider setup
   │   └── Header.tsx       # Wallet connect button
   └── app/
       └── layout.tsx       # (optional) Layout overrides
   ```
3. Update `src/index.ts`:
   - Add to `WalletProvider` type
   - Add to `WALLET_PROVIDERS` object
   - Add dependencies in `updatePackageJson()`
   - Add env vars in `updateEnvExample()`
4. Update help text in `showHelp()`
5. Add tests in `test/cli.test.js`
6. Update README.md and CHANGELOG.md

### For Solana

Same process, but under `templates/solana/your-provider/`

### Template Guidelines

- Use `"use client"` directive for client components
- Keep dependencies minimal
- Follow existing patterns for consistency
- Include proper TypeScript types
- Use Tailwind CSS for styling

## Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

Tests cover:
- CLI flags (`--help`, `--version`, `-c`, `-w`, etc.)
- Error handling (invalid inputs, conflicts)
- Template generation (file structure, dependencies)
- Package configuration

### Manual Testing

```bash
# Build and test locally
npm run build

# Test with different options
node dist/index.js test-project --chain evm --wallet rainbowkit --yes
node dist/index.js test-project --chain solana --wallet wallet-adapter --yes

# Clean up test projects
rm -rf test-project
```

## Pull Request Process

### Step-by-Step Guide

1. **Fork the repository** on GitHub (click the "Fork" button)

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/create-nextjs-dapp.git
   cd create-nextjs-dapp
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/0xmihirsahu/create-nextjs-dapp.git
   ```

4. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes** and commit them

6. **Sync with upstream before pushing:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

7. **Ensure quality:**
   ```bash
   npm run build    # No TypeScript errors
   npm test         # All tests pass
   ```

8. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Open a Pull Request:**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Select `0xmihirsahu/create-nextjs-dapp:main` as the base branch
   - Fill in the PR template

### PR Requirements

- [ ] Clear, descriptive title
- [ ] Description of changes and motivation
- [ ] Tests for new functionality
- [ ] Documentation updates (README, CHANGELOG)
- [ ] No breaking changes (or clearly documented)

### Review Process

1. Submit PR against `main` branch
2. CI checks must pass
3. Maintainer review
4. Address feedback if needed
5. Merge!

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Maintenance, dependencies |

### Examples

```bash
feat(wallet): add ConnectKit provider for EVM
fix(cli): handle empty directory edge case
docs(readme): update installation instructions
test(cli): add package manager flag tests
chore(deps): update @clack/prompts to v0.9.0
```

## Questions?

- Open an [issue](https://github.com/0xmihirsahu/create-nextjs-dapp/issues) for bugs or feature requests
- Start a [discussion](https://github.com/0xmihirsahu/create-nextjs-dapp/discussions) for questions

---

Thank you for contributing!
