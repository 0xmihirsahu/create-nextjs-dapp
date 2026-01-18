import { test, describe, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TEST_DIR = join(__dirname, "tmp-helpers");

// Import all helpers from the bundled module
import {
  getPkgManager,
  validateNpmName,
  isFolderEmpty,
  getConflictingFiles,
  isWriteable,
  copyDir,
  getRunCommand,
  getInstallCommand,
} from "../dist/helpers/index.js";

// Helper to create test directories
function setupTestDir() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
}

function cleanupTestDir() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// ============================================
// getPkgManager tests
// ============================================
describe("getPkgManager", () => {
  const originalUserAgent = process.env.npm_config_user_agent;

  afterEach(() => {
    // Restore original user agent
    if (originalUserAgent !== undefined) {
      process.env.npm_config_user_agent = originalUserAgent;
    } else {
      delete process.env.npm_config_user_agent;
    }
  });

  test("returns npm as default when no user agent", () => {
    delete process.env.npm_config_user_agent;
    assert.strictEqual(getPkgManager(), "npm");
  });

  test("detects yarn from user agent", () => {
    process.env.npm_config_user_agent = "yarn/1.22.19 npm/? node/v18.0.0";
    assert.strictEqual(getPkgManager(), "yarn");
  });

  test("detects pnpm from user agent", () => {
    process.env.npm_config_user_agent = "pnpm/8.6.0 npm/? node/v18.0.0";
    assert.strictEqual(getPkgManager(), "pnpm");
  });

  test("detects bun from user agent", () => {
    process.env.npm_config_user_agent = "bun/1.0.0 npm/? node/v18.0.0";
    assert.strictEqual(getPkgManager(), "bun");
  });

  test("returns npm for unknown user agent", () => {
    process.env.npm_config_user_agent = "unknown-package-manager/1.0.0";
    assert.strictEqual(getPkgManager(), "npm");
  });

  test("returns npm for empty user agent", () => {
    process.env.npm_config_user_agent = "";
    assert.strictEqual(getPkgManager(), "npm");
  });
});

// ============================================
// validateNpmName tests
// ============================================
describe("validateNpmName", () => {
  test("accepts valid lowercase name", () => {
    const result = validateNpmName("my-cool-app");
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.problems, undefined);
  });

  test("accepts valid name with numbers", () => {
    const result = validateNpmName("app123");
    assert.strictEqual(result.valid, true);
  });

  test("accepts valid name with hyphens", () => {
    const result = validateNpmName("my-dapp-project");
    assert.strictEqual(result.valid, true);
  });

  test("accepts scoped package name", () => {
    const result = validateNpmName("@myorg/my-package");
    assert.strictEqual(result.valid, true);
  });

  test("rejects name with uppercase letters", () => {
    const result = validateNpmName("MyApp");
    assert.strictEqual(result.valid, false);
    assert.ok(result.problems && result.problems.length > 0);
  });

  test("rejects name starting with dot", () => {
    const result = validateNpmName(".hidden-app");
    assert.strictEqual(result.valid, false);
    assert.ok(result.problems && result.problems.length > 0);
  });

  test("rejects name starting with underscore", () => {
    const result = validateNpmName("_private-app");
    assert.strictEqual(result.valid, false);
    assert.ok(result.problems && result.problems.length > 0);
  });

  test("rejects name with spaces", () => {
    const result = validateNpmName("my app");
    assert.strictEqual(result.valid, false);
    assert.ok(result.problems && result.problems.length > 0);
  });

  test("rejects name with special characters", () => {
    const result = validateNpmName("my@app!");
    assert.strictEqual(result.valid, false);
    assert.ok(result.problems && result.problems.length > 0);
  });

  test("rejects empty name", () => {
    const result = validateNpmName("");
    assert.strictEqual(result.valid, false);
  });

  test("rejects very long name (over 214 chars)", () => {
    const longName = "a".repeat(215);
    const result = validateNpmName(longName);
    assert.strictEqual(result.valid, false);
  });

  test("accepts name at max length (214 chars)", () => {
    const maxName = "a".repeat(214);
    const result = validateNpmName(maxName);
    assert.strictEqual(result.valid, true);
  });
});

// ============================================
// isFolderEmpty and getConflictingFiles tests
// ============================================
describe("isFolderEmpty", () => {
  before(() => {
    setupTestDir();
  });

  after(() => {
    cleanupTestDir();
  });

  test("returns true for empty directory", () => {
    const emptyDir = join(TEST_DIR, "empty");
    mkdirSync(emptyDir, { recursive: true });

    assert.strictEqual(isFolderEmpty(emptyDir, "empty"), true);
  });

  test("returns true for directory with only .git", () => {
    const gitDir = join(TEST_DIR, "with-git");
    mkdirSync(gitDir, { recursive: true });
    mkdirSync(join(gitDir, ".git"), { recursive: true });

    assert.strictEqual(isFolderEmpty(gitDir, "with-git"), true);
  });

  test("returns true for directory with only .DS_Store", () => {
    const dsDir = join(TEST_DIR, "with-ds-store");
    mkdirSync(dsDir, { recursive: true });
    writeFileSync(join(dsDir, ".DS_Store"), "");

    assert.strictEqual(isFolderEmpty(dsDir, "with-ds-store"), true);
  });

  test("returns true for directory with .gitignore", () => {
    const gitignoreDir = join(TEST_DIR, "with-gitignore");
    mkdirSync(gitignoreDir, { recursive: true });
    writeFileSync(join(gitignoreDir, ".gitignore"), "node_modules");

    assert.strictEqual(isFolderEmpty(gitignoreDir, "with-gitignore"), true);
  });

  test("returns true for directory with LICENSE", () => {
    const licenseDir = join(TEST_DIR, "with-license");
    mkdirSync(licenseDir, { recursive: true });
    writeFileSync(join(licenseDir, "LICENSE"), "MIT");

    assert.strictEqual(isFolderEmpty(licenseDir, "with-license"), true);
  });

  test("returns true for directory with .iml file (IntelliJ)", () => {
    const imlDir = join(TEST_DIR, "with-iml");
    mkdirSync(imlDir, { recursive: true });
    writeFileSync(join(imlDir, "project.iml"), "<xml>");

    assert.strictEqual(isFolderEmpty(imlDir, "with-iml"), true);
  });

  test("returns true for directory with multiple valid files", () => {
    const multiDir = join(TEST_DIR, "multi-valid");
    mkdirSync(multiDir, { recursive: true });
    writeFileSync(join(multiDir, ".gitignore"), "");
    writeFileSync(join(multiDir, "LICENSE"), "");
    writeFileSync(join(multiDir, ".DS_Store"), "");

    assert.strictEqual(isFolderEmpty(multiDir, "multi-valid"), true);
  });

  test("returns false for directory with package.json", () => {
    const pkgDir = join(TEST_DIR, "with-package");
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, "package.json"), "{}");

    assert.strictEqual(isFolderEmpty(pkgDir, "with-package"), false);
  });

  test("returns false for directory with src folder", () => {
    const srcDir = join(TEST_DIR, "with-src");
    mkdirSync(srcDir, { recursive: true });
    mkdirSync(join(srcDir, "src"), { recursive: true });

    assert.strictEqual(isFolderEmpty(srcDir, "with-src"), false);
  });

  test("returns false for directory with index.js", () => {
    const jsDir = join(TEST_DIR, "with-js");
    mkdirSync(jsDir, { recursive: true });
    writeFileSync(join(jsDir, "index.js"), "");

    assert.strictEqual(isFolderEmpty(jsDir, "with-js"), false);
  });
});

describe("getConflictingFiles", () => {
  before(() => {
    setupTestDir();
  });

  after(() => {
    cleanupTestDir();
  });

  test("returns empty array for empty directory", () => {
    const emptyDir = join(TEST_DIR, "conflicts-empty");
    mkdirSync(emptyDir, { recursive: true });

    const conflicts = getConflictingFiles(emptyDir);
    assert.deepStrictEqual(conflicts, []);
  });

  test("returns empty array for directory with only valid files", () => {
    const validDir = join(TEST_DIR, "conflicts-valid");
    mkdirSync(validDir, { recursive: true });
    writeFileSync(join(validDir, ".gitignore"), "");
    writeFileSync(join(validDir, "LICENSE"), "");
    mkdirSync(join(validDir, ".git"), { recursive: true });

    const conflicts = getConflictingFiles(validDir);
    assert.deepStrictEqual(conflicts, []);
  });

  test("returns conflicting files", () => {
    const conflictDir = join(TEST_DIR, "conflicts-has");
    mkdirSync(conflictDir, { recursive: true });
    writeFileSync(join(conflictDir, "package.json"), "{}");
    writeFileSync(join(conflictDir, "index.js"), "");
    writeFileSync(join(conflictDir, ".gitignore"), ""); // valid, should not be in conflicts

    const conflicts = getConflictingFiles(conflictDir);
    assert.ok(conflicts.includes("package.json"));
    assert.ok(conflicts.includes("index.js"));
    assert.ok(!conflicts.includes(".gitignore"));
    assert.strictEqual(conflicts.length, 2);
  });

  test("ignores .iml files", () => {
    const imlDir = join(TEST_DIR, "conflicts-iml");
    mkdirSync(imlDir, { recursive: true });
    writeFileSync(join(imlDir, "project.iml"), "");
    writeFileSync(join(imlDir, "module.iml"), "");

    const conflicts = getConflictingFiles(imlDir);
    assert.deepStrictEqual(conflicts, []);
  });
});

// ============================================
// isWriteable tests
// ============================================
describe("isWriteable", () => {
  before(() => {
    setupTestDir();
  });

  after(() => {
    cleanupTestDir();
  });

  test("returns true for writeable directory", () => {
    const writeableDir = join(TEST_DIR, "writeable");
    mkdirSync(writeableDir, { recursive: true });

    assert.strictEqual(isWriteable(writeableDir), true);
  });

  test("returns false for non-existent directory", () => {
    const nonExistent = join(TEST_DIR, "does-not-exist");

    assert.strictEqual(isWriteable(nonExistent), false);
  });

  test("returns true for current directory", () => {
    assert.strictEqual(isWriteable(process.cwd()), true);
  });
});

// ============================================
// copyDir tests
// ============================================
describe("copyDir", () => {
  beforeEach(() => {
    setupTestDir();
  });

  afterEach(() => {
    cleanupTestDir();
  });

  test("copies files from source to destination", () => {
    const src = join(TEST_DIR, "copy-src");
    const dest = join(TEST_DIR, "copy-dest");

    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, "file1.txt"), "content1");
    writeFileSync(join(src, "file2.txt"), "content2");

    copyDir(src, dest);

    assert.ok(existsSync(join(dest, "file1.txt")));
    assert.ok(existsSync(join(dest, "file2.txt")));
    assert.strictEqual(readFileSync(join(dest, "file1.txt"), "utf-8"), "content1");
    assert.strictEqual(readFileSync(join(dest, "file2.txt"), "utf-8"), "content2");
  });

  test("copies nested directories", () => {
    const src = join(TEST_DIR, "copy-nested-src");
    const dest = join(TEST_DIR, "copy-nested-dest");

    mkdirSync(join(src, "subdir"), { recursive: true });
    writeFileSync(join(src, "root.txt"), "root");
    writeFileSync(join(src, "subdir", "nested.txt"), "nested");

    copyDir(src, dest);

    assert.ok(existsSync(join(dest, "root.txt")));
    assert.ok(existsSync(join(dest, "subdir", "nested.txt")));
    assert.strictEqual(readFileSync(join(dest, "subdir", "nested.txt"), "utf-8"), "nested");
  });

  test("copies deeply nested directories", () => {
    const src = join(TEST_DIR, "copy-deep-src");
    const dest = join(TEST_DIR, "copy-deep-dest");

    mkdirSync(join(src, "a", "b", "c"), { recursive: true });
    writeFileSync(join(src, "a", "b", "c", "deep.txt"), "deep content");

    copyDir(src, dest);

    assert.ok(existsSync(join(dest, "a", "b", "c", "deep.txt")));
  });

  test("respects excludes parameter", () => {
    const src = join(TEST_DIR, "copy-exclude-src");
    const dest = join(TEST_DIR, "copy-exclude-dest");

    mkdirSync(src, { recursive: true });
    mkdirSync(join(src, "node_modules"), { recursive: true });
    writeFileSync(join(src, "index.js"), "code");
    writeFileSync(join(src, "node_modules", "dep.js"), "dep");

    copyDir(src, dest, ["node_modules"]);

    assert.ok(existsSync(join(dest, "index.js")));
    assert.ok(!existsSync(join(dest, "node_modules")));
  });

  test("respects multiple excludes", () => {
    const src = join(TEST_DIR, "copy-multi-exclude-src");
    const dest = join(TEST_DIR, "copy-multi-exclude-dest");

    mkdirSync(src, { recursive: true });
    mkdirSync(join(src, "node_modules"), { recursive: true });
    mkdirSync(join(src, ".next"), { recursive: true });
    mkdirSync(join(src, ".git"), { recursive: true });
    writeFileSync(join(src, "index.js"), "code");

    copyDir(src, dest, ["node_modules", ".next", ".git"]);

    assert.ok(existsSync(join(dest, "index.js")));
    assert.ok(!existsSync(join(dest, "node_modules")));
    assert.ok(!existsSync(join(dest, ".next")));
    assert.ok(!existsSync(join(dest, ".git")));
  });

  test("creates destination directory if it does not exist", () => {
    const src = join(TEST_DIR, "copy-create-src");
    const dest = join(TEST_DIR, "copy-create-dest", "nested", "path");

    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, "file.txt"), "content");

    copyDir(src, dest);

    assert.ok(existsSync(join(dest, "file.txt")));
  });

  test("overwrites existing files", () => {
    const src = join(TEST_DIR, "copy-overwrite-src");
    const dest = join(TEST_DIR, "copy-overwrite-dest");

    mkdirSync(src, { recursive: true });
    mkdirSync(dest, { recursive: true });

    writeFileSync(join(src, "file.txt"), "new content");
    writeFileSync(join(dest, "file.txt"), "old content");

    copyDir(src, dest);

    const content = readFileSync(join(dest, "file.txt"), "utf-8");
    assert.strictEqual(content, "new content");
  });

  test("preserves existing files not in source", () => {
    const src = join(TEST_DIR, "copy-preserve-src");
    const dest = join(TEST_DIR, "copy-preserve-dest");

    mkdirSync(src, { recursive: true });
    mkdirSync(dest, { recursive: true });

    writeFileSync(join(src, "new.txt"), "new");
    writeFileSync(join(dest, "existing.txt"), "existing");

    copyDir(src, dest);

    assert.ok(existsSync(join(dest, "new.txt")));
    assert.ok(existsSync(join(dest, "existing.txt")));
  });
});

// ============================================
// getRunCommand tests
// ============================================
describe("getRunCommand", () => {
  test("returns correct command for npm", () => {
    assert.strictEqual(getRunCommand("npm"), "npm run dev");
  });

  test("returns correct command for yarn", () => {
    assert.strictEqual(getRunCommand("yarn"), "yarn dev");
  });

  test("returns correct command for pnpm", () => {
    assert.strictEqual(getRunCommand("pnpm"), "pnpm dev");
  });

  test("returns correct command for bun", () => {
    assert.strictEqual(getRunCommand("bun"), "bun dev");
  });
});

// ============================================
// getInstallCommand tests
// ============================================
describe("getInstallCommand", () => {
  test("returns correct command for npm", () => {
    assert.strictEqual(getInstallCommand("npm"), "npm install");
  });

  test("returns correct command for yarn", () => {
    assert.strictEqual(getInstallCommand("yarn"), "yarn");
  });

  test("returns correct command for pnpm", () => {
    assert.strictEqual(getInstallCommand("pnpm"), "pnpm install");
  });

  test("returns correct command for bun", () => {
    assert.strictEqual(getInstallCommand("bun"), "bun install");
  });
});
