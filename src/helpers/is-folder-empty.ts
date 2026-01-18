import { readdirSync, lstatSync } from "fs";
import { join } from "path";

// Files that are allowed to exist in the target directory
const VALID_FILES = [
  ".DS_Store",
  ".git",
  ".gitattributes",
  ".gitignore",
  ".gitlab-ci.yml",
  ".hg",
  ".hgcheck",
  ".hgignore",
  ".idea",
  ".npmignore",
  ".travis.yml",
  "LICENSE",
  "Thumbs.db",
  "docs",
  "mkdocs.yml",
  "npm-debug.log",
  "yarn-debug.log",
  "yarn-error.log",
  "pnpm-debug.log",
  "bun.lockb",
];

export function isFolderEmpty(root: string, name: string): boolean {
  const validFiles = VALID_FILES;

  const conflicts = readdirSync(root).filter(
    (file) =>
      !validFiles.includes(file) &&
      // Support IntelliJ IDEA-based editors
      !/\.iml$/.test(file)
  );

  if (conflicts.length > 0) {
    return false;
  }

  return true;
}

export function getConflictingFiles(root: string): string[] {
  const validFiles = VALID_FILES;

  return readdirSync(root).filter(
    (file) =>
      !validFiles.includes(file) &&
      !/\.iml$/.test(file)
  );
}
