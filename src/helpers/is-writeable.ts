import { accessSync, constants } from "fs";

export function isWriteable(directory: string): boolean {
  try {
    accessSync(directory, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
