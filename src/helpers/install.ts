import { execSync } from "child_process";
import type { PackageManager } from "./get-pkg-manager";

export function install(
  root: string,
  packageManager: PackageManager
): boolean {
  const commands: Record<PackageManager, string> = {
    npm: "npm install",
    yarn: "yarn",
    pnpm: "pnpm install",
    bun: "bun install",
  };

  try {
    execSync(commands[packageManager], {
      cwd: root,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

export function getRunCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case "yarn":
      return "yarn dev";
    case "pnpm":
      return "pnpm dev";
    case "bun":
      return "bun dev";
    default:
      return "npm run dev";
  }
}

export function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case "yarn":
      return "yarn";
    case "pnpm":
      return "pnpm install";
    case "bun":
      return "bun install";
    default:
      return "npm install";
  }
}
