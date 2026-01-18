import { cpSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join } from "path";

export function copyDir(
  src: string,
  dest: string,
  excludes: string[] = []
): void {
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (excludes.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, excludes);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}
