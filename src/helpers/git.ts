import { execSync } from "child_process";

function isInGitRepository(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isInMercurialRepository(): boolean {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isDefaultBranchSet(): boolean {
  try {
    execSync("git config init.defaultBranch", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function tryGitInit(root: string): boolean {
  let didInit = false;

  try {
    execSync("git --version", { stdio: "ignore" });

    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { cwd: root, stdio: "ignore" });
    didInit = true;

    if (!isDefaultBranchSet()) {
      execSync("git checkout -b main", { cwd: root, stdio: "ignore" });
    }

    execSync("git add -A", { cwd: root, stdio: "ignore" });
    execSync('git commit -m "Initial commit from create-nextjs-dapp"', {
      cwd: root,
      stdio: "ignore",
    });

    return true;
  } catch {
    if (didInit) {
      try {
        const { rmSync } = require("fs");
        rmSync(`${root}/.git`, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    return false;
  }
}
