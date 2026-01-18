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
    const wallets = ["privy", "dynamic", "reown", "thirdweb"];

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
  const projectName = "test-generated-dapp";
  const projectPath = join(TEST_DIR, projectName);

  before(() => {
    cleanup();
    mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    cleanup();
  });

  test("generates EVM project with rainbowkit using --yes flag", () => {
    // Generate project with all flags (non-interactive)
    execSync(
      `node ${CLI_PATH} ${projectName} --chain evm --wallet rainbowkit --yes`,
      {
        cwd: TEST_DIR,
        encoding: "utf-8",
        stdio: "pipe",
      }
    );

    // Verify project was created
    assert.ok(existsSync(projectPath), "Project directory should be created");

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
        `Generated project should have ${file}`
      );
    }

    // Verify package.json has correct name, description, and dependencies
    const pkg = JSON.parse(readFileSync(join(projectPath, "package.json"), "utf-8"));
    assert.strictEqual(pkg.name, projectName, "Package name should match project name");
    assert.ok(pkg.description.includes("Ethereum"), "Description should mention Ethereum for EVM");
    assert.ok(pkg.description.includes("RainbowKit"), "Description should mention wallet provider");
    assert.ok(pkg.dependencies["@rainbow-me/rainbowkit"], "Should have rainbowkit dependency");
    assert.ok(pkg.dependencies["wagmi"], "Should have wagmi dependency");
    assert.ok(pkg.dependencies["viem"], "Should have viem dependency");

    // Verify .env.example has correct content
    const envContent = readFileSync(join(projectPath, ".env.example"), "utf-8");
    assert.ok(
      envContent.includes("WALLETCONNECT_PROJECT_ID"),
      ".env.example should have WalletConnect config for rainbowkit"
    );

    // Verify app directory structure
    assert.ok(
      existsSync(join(projectPath, "app")),
      "Should have app directory"
    );
    assert.ok(
      existsSync(join(projectPath, "components")),
      "Should have components directory"
    );
  });

  test("generates Solana project with dynamic using --yes flag", () => {
    const solanaProjectName = "test-solana-dapp";
    const solanaProjectPath = join(TEST_DIR, solanaProjectName);

    execSync(
      `node ${CLI_PATH} ${solanaProjectName} --chain solana --wallet dynamic --yes`,
      {
        cwd: TEST_DIR,
        encoding: "utf-8",
        stdio: "pipe",
      }
    );

    assert.ok(existsSync(solanaProjectPath), "Solana project should be created");

    const pkg = JSON.parse(readFileSync(join(solanaProjectPath, "package.json"), "utf-8"));
    assert.strictEqual(pkg.name, solanaProjectName, "Package name should match");
    assert.ok(pkg.description.includes("Solana"), "Description should mention Solana");
    assert.ok(pkg.description.includes("Dynamic"), "Description should mention wallet provider");
    assert.ok(pkg.dependencies["@solana/web3.js"], "Should have solana web3 dependency");
    assert.ok(pkg.dependencies["@dynamic-labs/solana"], "Should have dynamic solana dependency");

    // Cleanup this specific project
    rmSync(solanaProjectPath, { recursive: true, force: true });
  });
});
