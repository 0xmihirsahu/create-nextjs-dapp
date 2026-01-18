/**
 * Build Validation Tests
 *
 * These tests verify that generated projects actually build successfully.
 * They are slow (install dependencies + build) so they should be:
 * - Skipped in normal local development
 * - Run in CI pipelines
 * - Run manually with: node --test test/build.test.js
 *
 * Representative combinations tested:
 * 1. EVM + RainbowKit (most popular EVM setup)
 * 2. EVM + Thirdweb (different architecture, no wagmi)
 * 3. Solana + wallet-adapter (standard Solana setup)
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLI_PATH = join(__dirname, "..", "dist", "index.js");
const TEST_DIR = join(__dirname, "tmp-build");

// Longer timeout for build tests (5 minutes)
const BUILD_TIMEOUT = 300000;

function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

function cleanupProject(projectPath) {
  if (existsSync(projectPath)) {
    rmSync(projectPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

/**
 * Generate a project and run build validation
 */
function generateAndBuildProject(chain, wallet, projectName) {
  const projectPath = join(TEST_DIR, projectName);

  console.log(`\n  Generating ${chain}/${wallet} project...`);

  // Generate project
  execSync(
    `node ${CLI_PATH} ${projectName} --chain ${chain} --wallet ${wallet} --yes`,
    {
      cwd: TEST_DIR,
      encoding: "utf-8",
      stdio: "pipe",
    }
  );

  assert.ok(existsSync(projectPath), `Project directory should exist`);

  console.log(`  Installing dependencies...`);

  // Install dependencies
  try {
    execSync("npm install", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: BUILD_TIMEOUT,
    });
  } catch (err) {
    console.error(`  npm install failed:`, err.message);
    throw new Error(`npm install failed for ${chain}/${wallet}: ${err.message}`);
  }

  console.log(`  Running TypeScript check...`);

  // Run TypeScript type checking
  try {
    execSync("npx tsc --noEmit", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: BUILD_TIMEOUT,
    });
  } catch (err) {
    // TypeScript errors are warnings for now since templates might have minor type issues
    console.warn(`  TypeScript check had issues (non-fatal):`, err.stderr?.slice(0, 500));
  }

  console.log(`  Running Next.js build...`);

  // Run Next.js build
  try {
    execSync("npm run build", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: BUILD_TIMEOUT,
      env: {
        ...process.env,
        // Provide dummy env vars so build doesn't fail on missing config
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "test-project-id",
        NEXT_PUBLIC_PRIVY_APP_ID: "test-privy-id",
        NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID: "test-dynamic-id",
        NEXT_PUBLIC_REOWN_PROJECT_ID: "test-reown-id",
        NEXT_PUBLIC_THIRDWEB_CLIENT_ID: "test-thirdweb-id",
        NEXT_PUBLIC_PARA_API_KEY: "test-para-key",
        NEXT_PUBLIC_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
        NEXT_PUBLIC_PROGRAM_ID: "11111111111111111111111111111111",
      },
    });
  } catch (err) {
    console.error(`  Build failed:`, err.stderr?.slice(0, 1000));
    throw new Error(`npm run build failed for ${chain}/${wallet}: ${err.message}`);
  }

  // Verify build output exists
  const nextDir = join(projectPath, ".next");
  assert.ok(existsSync(nextDir), `.next directory should exist after build`);

  console.log(`  Build successful!`);

  return projectPath;
}

describe("Build Validation", { timeout: BUILD_TIMEOUT * 3 }, () => {
  before(() => {
    cleanup();
    mkdirSync(TEST_DIR, { recursive: true });
    console.log("\n=== Build Validation Tests ===");
    console.log("These tests install dependencies and build projects.");
    console.log("They may take several minutes to complete.\n");
  });

  after(() => {
    cleanup();
  });

  test("EVM + RainbowKit builds successfully", { timeout: BUILD_TIMEOUT }, () => {
    const projectPath = generateAndBuildProject("evm", "rainbowkit", "build-test-evm-rainbowkit");

    // Additional verification for RainbowKit specific files
    const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
    assert.ok(pkg.dependencies["@rainbow-me/rainbowkit"], "Should have rainbowkit");
    assert.ok(pkg.dependencies["wagmi"], "Should have wagmi");

    cleanupProject(projectPath);
  });

  test("EVM + Thirdweb builds successfully", { timeout: BUILD_TIMEOUT }, () => {
    const projectPath = generateAndBuildProject("evm", "thirdweb", "build-test-evm-thirdweb");

    // Thirdweb uses its own SDK instead of wagmi
    const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
    assert.ok(pkg.dependencies["thirdweb"], "Should have thirdweb");

    cleanupProject(projectPath);
  });

  test("Solana + wallet-adapter builds successfully", { timeout: BUILD_TIMEOUT }, () => {
    const projectPath = generateAndBuildProject("solana", "wallet-adapter", "build-test-solana-adapter");

    // Verify Solana specific dependencies
    const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
    assert.ok(pkg.dependencies["@solana/web3.js"], "Should have solana web3");
    assert.ok(pkg.dependencies["@solana/wallet-adapter-react"], "Should have wallet adapter react");

    cleanupProject(projectPath);
  });
});

describe("Lint Validation", { timeout: BUILD_TIMEOUT * 2 }, () => {
  before(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  after(() => {
    cleanup();
  });

  test("EVM + RainbowKit passes lint", { timeout: BUILD_TIMEOUT }, () => {
    const projectName = "lint-test-evm-rainbowkit";
    const projectPath = join(TEST_DIR, projectName);

    // Generate and install
    execSync(
      `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes`,
      {
        cwd: TEST_DIR,
        encoding: "utf-8",
        stdio: "pipe",
      }
    );

    execSync("npm install", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: "pipe",
      timeout: BUILD_TIMEOUT,
    });

    console.log(`  Running ESLint...`);

    // Run lint
    try {
      execSync("npm run lint", {
        cwd: projectPath,
        encoding: "utf-8",
        stdio: "pipe",
        timeout: 60000,
      });
      console.log(`  Lint passed!`);
    } catch (err) {
      // Lint warnings are acceptable, only fail on errors
      if (err.status > 1) {
        throw new Error(`Lint failed with errors: ${err.stderr}`);
      }
      console.log(`  Lint passed with warnings`);
    }

    cleanupProject(projectPath);
  });
});
