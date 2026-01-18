import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { execSync } from "node:child_process";
import { existsSync, rmSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLI_PATH = join(__dirname, "..", "dist", "index.js");
const TEST_DIR = join(__dirname, "tmp");

// Cleanup helper
function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

describe("CLI", () => {
  test("--help shows usage information", () => {
    const output = execSync(`node ${CLI_PATH} --help`, {
      encoding: "utf-8",
    });

    assert.ok(output.includes("create-nextjs-dapp"), "Should show CLI name");
    assert.ok(output.includes("Usage:"), "Should show usage section");
    assert.ok(output.includes("--chain"), "Should show chain option");
    assert.ok(output.includes("--wallet"), "Should show wallet option");
    assert.ok(output.includes("rainbowkit"), "Should list wallet providers");
  });

  test("-h shows usage information", () => {
    const output = execSync(`node ${CLI_PATH} -h`, { encoding: "utf-8" });

    assert.ok(output.includes("create-nextjs-dapp"), "Should show CLI name");
  });

  test("--version shows version number", () => {
    const output = execSync(`node ${CLI_PATH} --version`, {
      encoding: "utf-8",
    });

    assert.ok(
      output.includes("create-nextjs-dapp v"),
      "Should show version with prefix"
    );
    assert.match(output, /v\d+\.\d+\.\d+/, "Should contain semantic version");
  });

  test("-v shows version number", () => {
    const output = execSync(`node ${CLI_PATH} -v`, { encoding: "utf-8" });

    assert.ok(output.includes("create-nextjs-dapp v"), "Should show version");
  });

  test("--help shows --git flag", () => {
    const output = execSync(`node ${CLI_PATH} --help`, { encoding: "utf-8" });

    assert.ok(output.includes("--git"), "Should show --git option");
    assert.ok(output.includes("Initialize a git repository"), "Should describe --git");
  });

  test("--help shows --install flag", () => {
    const output = execSync(`node ${CLI_PATH} --help`, { encoding: "utf-8" });

    assert.ok(output.includes("--install"), "Should show --install option");
    assert.ok(output.includes("Install dependencies"), "Should describe --install");
  });

  test("--help shows package manager flags", () => {
    const output = execSync(`node ${CLI_PATH} --help`, { encoding: "utf-8" });

    assert.ok(output.includes("--use-npm"), "Should show --use-npm option");
    assert.ok(output.includes("--use-yarn"), "Should show --use-yarn option");
    assert.ok(output.includes("--use-pnpm"), "Should show --use-pnpm option");
    assert.ok(output.includes("--use-bun"), "Should show --use-bun option");
  });
});

describe("Error Handling", () => {
  test("shows error for invalid chain", () => {
    try {
      execSync(`node ${CLI_PATH} --chain invalid`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Invalid chain"), "Should show invalid chain error");
      assert.ok(err.stderr.includes("evm, solana"), "Should list valid chains");
    }
  });

  test("shows error for invalid wallet provider", () => {
    try {
      execSync(`node ${CLI_PATH} --wallet invalid`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Invalid wallet provider"), "Should show invalid wallet error");
      assert.ok(err.stderr.includes("rainbowkit"), "Should list valid wallets");
    }
  });

  test("shows error for unknown flag", () => {
    try {
      execSync(`node ${CLI_PATH} --unknown-flag`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Unknown option"), "Should show unknown option error");
    }
  });

  test("shows error for invalid project name", () => {
    try {
      execSync(`node ${CLI_PATH} "Invalid_Name!"`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Invalid project name"), "Should show invalid name error");
    }
  });

  test("shows error for incompatible wallet/chain combo in non-interactive mode", () => {
    try {
      execSync(`node ${CLI_PATH} test-app --chain solana --wallet rainbowkit --yes`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(
        err.stdout.includes("doesn't support") || err.stderr.includes("doesn't support"),
        "Should show incompatibility error"
      );
    }
  });

  test("shows error for project name starting with dot", () => {
    try {
      execSync(`node ${CLI_PATH} .invalid-name`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Invalid project name"), "Should show invalid name error");
    }
  });

  test("shows error for project name with uppercase letters", () => {
    try {
      execSync(`node ${CLI_PATH} InvalidName`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.ok(err.stderr.includes("Invalid project name"), "Should show invalid name error");
    }
  });
});

describe("Template Generation", () => {
  test("templates directory exists", () => {
    const templatesDir = join(__dirname, "..", "templates");
    assert.ok(existsSync(templatesDir), "Templates directory should exist");
  });

  test("base template exists", () => {
    const baseDir = join(__dirname, "..", "templates", "base");
    assert.ok(existsSync(baseDir), "Base template should exist");
    assert.ok(
      existsSync(join(baseDir, "package.json")),
      "Base package.json should exist"
    );
  });

  test("EVM wallet templates exist", () => {
    const evmDir = join(__dirname, "..", "templates", "evm");
    const wallets = [
      "rainbowkit",
      "connectkit",
      "privy",
      "dynamic",
      "reown",
      "thirdweb",
      "getpara",
    ];

    for (const wallet of wallets) {
      const walletDir = join(evmDir, wallet);
      assert.ok(
        existsSync(walletDir),
        `EVM ${wallet} template should exist`
      );
    }
  });

  test("Solana wallet templates exist", () => {
    const solanaDir = join(__dirname, "..", "templates", "solana");
    const wallets = ["wallet-adapter", "privy", "dynamic", "reown", "thirdweb"];

    for (const wallet of wallets) {
      const walletDir = join(solanaDir, wallet);
      assert.ok(
        existsSync(walletDir),
        `Solana ${wallet} template should exist`
      );
    }
  });

  test("base template has required files", () => {
    const baseDir = join(__dirname, "..", "templates", "base");
    const requiredFiles = [
      "package.json",
      "tsconfig.json",
      "tailwind.config.ts",
      "next.config.js",
    ];

    for (const file of requiredFiles) {
      assert.ok(
        existsSync(join(baseDir, file)),
        `Base template should have ${file}`
      );
    }
  });

  test("base template package.json is valid JSON", () => {
    const pkgPath = join(__dirname, "..", "templates", "base", "package.json");
    const content = readFileSync(pkgPath, "utf-8");

    assert.doesNotThrow(() => {
      JSON.parse(content);
    }, "package.json should be valid JSON");
  });
});

describe("Package Configuration", () => {
  test("main package.json has correct bin entry", () => {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    assert.ok(pkg.bin, "Should have bin field");
    assert.ok(
      pkg.bin["create-nextjs-dapp"],
      "Should have create-nextjs-dapp binary"
    );
    assert.strictEqual(
      pkg.bin["create-nextjs-dapp"],
      "./dist/index.js",
      "Binary should point to dist/index.js"
    );
  });

  test("package.json includes required files", () => {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    assert.ok(pkg.files, "Should have files field");
    assert.ok(pkg.files.includes("dist"), "Should include dist");
    assert.ok(pkg.files.includes("templates"), "Should include templates");
  });

  test("package.json has correct type", () => {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    assert.strictEqual(pkg.type, "module", "Should be ESM module");
  });

  test("package.json has repository field", () => {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    assert.ok(pkg.repository, "Should have repository field");
    assert.ok(pkg.repository.url, "Repository should have url");
  });
});

describe("Project Generation (Integration)", () => {
  before(() => {
    cleanup();
    mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    cleanup();
  });

  // Helper function to generate and verify a project
  function generateAndVerifyProject(chain, wallet, expectedDeps, expectedEnvVars) {
    const projectName = `test-${chain}-${wallet}`;
    const projectPath = join(TEST_DIR, projectName);

    // Generate project
    execSync(
      `node ${CLI_PATH} ${projectName} --chain ${chain} --wallet ${wallet} --yes`,
      {
        cwd: TEST_DIR,
        encoding: "utf-8",
        stdio: "pipe",
      }
    );

    // Verify project was created
    assert.ok(existsSync(projectPath), `${chain}/${wallet} project should be created`);

    // Verify essential files exist
    const requiredFiles = [
      "package.json",
      "tsconfig.json",
      "tailwind.config.ts",
      "next.config.js",
      ".env.example",
    ];

    for (const file of requiredFiles) {
      assert.ok(
        existsSync(join(projectPath, file)),
        `${chain}/${wallet} project should have ${file}`
      );
    }

    // Verify directories exist
    assert.ok(existsSync(join(projectPath, "app")), `${chain}/${wallet} should have app directory`);
    assert.ok(existsSync(join(projectPath, "components")), `${chain}/${wallet} should have components directory`);

    // Verify package.json
    const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
    assert.strictEqual(pkg.name, projectName, "Package name should match project name");

    // Verify expected dependencies
    for (const dep of expectedDeps) {
      assert.ok(pkg.dependencies[dep], `${chain}/${wallet} should have ${dep} dependency`);
    }

    // Verify .env.example has expected variables
    const envContent = readFileSync(join(projectPath, ".env.example"), "utf-8");
    for (const envVar of expectedEnvVars) {
      assert.ok(
        envContent.includes(envVar),
        `${chain}/${wallet} .env.example should have ${envVar}`
      );
    }

    // Cleanup
    rmSync(projectPath, { recursive: true, force: true });
  }

  // ==========================================
  // EVM Wallet Tests (7 wallets)
  // ==========================================
  describe("EVM Wallets", () => {
    test("generates EVM project with rainbowkit", () => {
      generateAndVerifyProject(
        "evm",
        "rainbowkit",
        ["@rainbow-me/rainbowkit", "wagmi", "viem"],
        ["WALLETCONNECT_PROJECT_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with connectkit", () => {
      generateAndVerifyProject(
        "evm",
        "connectkit",
        ["connectkit", "wagmi", "viem"],
        ["WALLETCONNECT_PROJECT_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with privy", () => {
      generateAndVerifyProject(
        "evm",
        "privy",
        ["@privy-io/react-auth", "@privy-io/wagmi", "wagmi", "viem"],
        ["PRIVY_APP_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with dynamic", () => {
      generateAndVerifyProject(
        "evm",
        "dynamic",
        ["@dynamic-labs/ethereum", "@dynamic-labs/sdk-react-core", "wagmi", "viem"],
        ["DYNAMIC_ENVIRONMENT_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with reown", () => {
      generateAndVerifyProject(
        "evm",
        "reown",
        ["@reown/appkit", "@reown/appkit-adapter-wagmi", "wagmi", "viem"],
        ["REOWN_PROJECT_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with thirdweb", () => {
      generateAndVerifyProject(
        "evm",
        "thirdweb",
        ["thirdweb"],
        ["THIRDWEB_CLIENT_ID", "CONTRACT_ADDRESS"]
      );
    });

    test("generates EVM project with getpara", () => {
      generateAndVerifyProject(
        "evm",
        "getpara",
        ["@getpara/react-sdk", "wagmi", "viem"],
        ["PARA_API_KEY", "CONTRACT_ADDRESS"]
      );
    });
  });

  // ==========================================
  // Solana Wallet Tests (5 wallets)
  // ==========================================
  describe("Solana Wallets", () => {
    test("generates Solana project with wallet-adapter", () => {
      generateAndVerifyProject(
        "solana",
        "wallet-adapter",
        ["@solana/web3.js", "@solana/wallet-adapter-react", "@solana/wallet-adapter-react-ui"],
        ["PROGRAM_ID"]
      );
    });

    test("generates Solana project with privy", () => {
      generateAndVerifyProject(
        "solana",
        "privy",
        ["@privy-io/react-auth", "@solana/web3.js"],
        ["PRIVY_APP_ID", "PROGRAM_ID"]
      );
    });

    test("generates Solana project with dynamic", () => {
      generateAndVerifyProject(
        "solana",
        "dynamic",
        ["@dynamic-labs/solana", "@dynamic-labs/sdk-react-core", "@solana/web3.js"],
        ["DYNAMIC_ENVIRONMENT_ID", "PROGRAM_ID"]
      );
    });

    test("generates Solana project with reown", () => {
      generateAndVerifyProject(
        "solana",
        "reown",
        ["@reown/appkit", "@reown/appkit-adapter-solana", "@solana/web3.js"],
        ["REOWN_PROJECT_ID", "PROGRAM_ID"]
      );
    });

    test("generates Solana project with thirdweb", () => {
      generateAndVerifyProject(
        "solana",
        "thirdweb",
        ["thirdweb", "@solana/web3.js"],
        ["THIRDWEB_CLIENT_ID", "PROGRAM_ID"]
      );
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe("Edge Cases", () => {
    test("--git flag attempts git initialization", () => {
      const projectName = "test-with-git";
      const projectPath = join(TEST_DIR, projectName);

      // Note: When running inside an existing git repo (like during development),
      // git init will not create a new .git directory. This test verifies the
      // --git flag doesn't cause errors and the project is created successfully.
      const output = execSync(
        `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes --git`,
        {
          cwd: TEST_DIR,
          encoding: "utf-8",
          stdio: "pipe",
        }
      );

      assert.ok(existsSync(projectPath), "Project should be created");
      // The output should mention git initialization attempt
      assert.ok(
        output.includes("git") || output.includes("Git"),
        "Output should mention git initialization"
      );

      rmSync(projectPath, { recursive: true, force: true });
    });

    test("handles project creation in current directory style name", () => {
      const projectName = "my-dapp";
      const projectPath = join(TEST_DIR, projectName);

      execSync(
        `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes`,
        {
          cwd: TEST_DIR,
          encoding: "utf-8",
          stdio: "pipe",
        }
      );

      assert.ok(existsSync(projectPath), "Project should be created");

      const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
      assert.strictEqual(pkg.name, projectName, "Package name should match");

      rmSync(projectPath, { recursive: true, force: true });
    });

    test("project description mentions correct chain for EVM", () => {
      const projectName = "test-evm-desc";
      const projectPath = join(TEST_DIR, projectName);

      execSync(
        `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes`,
        {
          cwd: TEST_DIR,
          encoding: "utf-8",
          stdio: "pipe",
        }
      );

      const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
      assert.ok(pkg.description.includes("Ethereum"), "Description should mention Ethereum");
      assert.ok(pkg.description.includes("RainbowKit"), "Description should mention wallet");

      rmSync(projectPath, { recursive: true, force: true });
    });

    test("project description mentions correct chain for Solana", () => {
      const projectName = "test-solana-desc";
      const projectPath = join(TEST_DIR, projectName);

      execSync(
        `node ${CLI_PATH} ${projectName} --chain solana --wallet wallet-adapter --yes`,
        {
          cwd: TEST_DIR,
          encoding: "utf-8",
          stdio: "pipe",
        }
      );

      const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
      assert.ok(pkg.description.includes("Solana"), "Description should mention Solana");
      assert.ok(pkg.description.includes("Solana Wallet Adapter"), "Description should mention wallet");

      rmSync(projectPath, { recursive: true, force: true });
    });

    test("dependencies are sorted alphabetically", () => {
      const projectName = "test-sorted-deps";
      const projectPath = join(TEST_DIR, projectName);

      execSync(
        `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes`,
        {
          cwd: TEST_DIR,
          encoding: "utf-8",
          stdio: "pipe",
        }
      );

      const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
      const deps = Object.keys(pkg.dependencies);
      const sortedDeps = [...deps].sort((a, b) => a.localeCompare(b));

      assert.deepStrictEqual(deps, sortedDeps, "Dependencies should be sorted alphabetically");

      rmSync(projectPath, { recursive: true, force: true });
    });
  });
});
