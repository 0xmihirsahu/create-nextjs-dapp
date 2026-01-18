# Testing Strategy Design

## Overview

Comprehensive test coverage for `create-nextjs-dapp` CLI tool to ensure reliability before production release.

## Current State

- 1 test file (`test/cli.test.js`) with ~20 tests
- Covers CLI flags, error handling, template existence
- 2 integration tests that generate actual projects
- Uses Node's built-in test runner
- **Gap**: No unit tests for helpers, no build validation, incomplete wallet/chain coverage

## Testing Architecture

### 1. Unit Tests for Helpers (`test/helpers.test.js`)

Pure function tests with mocked filesystem/environment where needed.

| Helper | Test Cases |
|--------|------------|
| `getPkgManager()` | Default (npm), yarn detection, pnpm detection, bun detection |
| `validateNpmName()` | Valid names, uppercase rejection, dot-prefix rejection, special chars, scoped packages |
| `isFolderEmpty()` | Empty dir, valid files only (.git, .DS_Store), has conflicts |
| `getConflictingFiles()` | Returns correct conflict list, ignores valid files |
| `isWriteable()` | Writeable directory, non-writeable directory |
| `copyDir()` | Basic copy, with excludes, nested directories, overwrites existing |
| `getRunCommand()` | npm → "npm run dev", yarn → "yarn dev", pnpm → "pnpm dev", bun → "bun dev" |
| `getInstallCommand()` | npm → "npm install", yarn → "yarn", pnpm → "pnpm install", bun → "bun install" |

### 2. Integration Tests - All Wallet/Chain Combos (`test/cli.test.js`)

Expand existing integration tests to cover all 12 combinations:

**EVM (7 wallets):**
- rainbowkit, connectkit, privy, dynamic, reown, thirdweb, getpara

**Solana (5 wallets):**
- wallet-adapter, privy, dynamic, reown, thirdweb

Each generated project verified for:
- Correct `package.json` name and description
- Correct dependencies for wallet provider
- Correct `.env.example` with provider-specific variables
- All required files exist (app/, components/, etc.)

### 3. Build Validation Tests (`test/build.test.js`)

Slower tests that verify generated projects actually compile.

**Representative combinations:**
1. EVM + RainbowKit (most popular EVM)
2. EVM + Privy (embedded wallet, different setup)
3. Solana + wallet-adapter (standard Solana)

Each test:
1. Generate project with `--yes` flag
2. Run `npm install`
3. Run `npm run build`
4. Run `npm run lint` (if available)
5. Verify TypeScript compilation (`npx tsc --noEmit`)

**Execution strategy:**
- Skip by default in local development (slow)
- Run in CI pipeline
- Can be run manually with `node --test test/build.test.js`

## File Structure

```
test/
├── cli.test.js          # Existing - CLI flags, errors, integration
├── helpers.test.js      # New - Unit tests for all helper functions
├── build.test.js        # New - Build validation (CI-focused)
└── tmp/                  # Temporary directory for generated projects
```

## Test Commands

```bash
# Run all fast tests (default)
npm test

# Run specific test file
node --test test/helpers.test.js

# Run build validation (slow, CI)
node --test test/build.test.js

# Run everything including slow tests
npm run test:all
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "node --test test/cli.test.js test/helpers.test.js",
    "test:all": "node --test test/*.test.js",
    "test:build": "node --test test/build.test.js"
  }
}
```

## Success Criteria

- [x] All helper functions have unit tests (51 tests)
- [x] All 12 wallet/chain combinations generate valid projects
- [x] Representative projects build successfully (EVM+RainbowKit, EVM+Thirdweb, Solana+wallet-adapter)
- [x] Tests run in < 30 seconds (excluding build tests) - ~4.3s for 92 tests
- [ ] Build tests run in < 5 minutes in CI (to be verified)

## Implementation Notes

### Test Count Summary
- **Unit tests (helpers.test.js)**: 51 tests
- **Integration tests (cli.test.js)**: 41 tests
- **Build validation tests (build.test.js)**: 4 tests (slow, CI-focused)
- **Total**: 96 tests

### Scripts Added
```json
{
  "test": "node --test test/cli.test.js test/helpers.test.js",
  "test:all": "node --test test/*.test.js",
  "test:build": "node --test test/build.test.js",
  "test:unit": "node --test test/helpers.test.js",
  "test:integration": "node --test test/cli.test.js"
}
```
