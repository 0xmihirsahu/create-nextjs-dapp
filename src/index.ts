#!/usr/bin/env node

import * as p from "@clack/prompts";
import pc from "picocolors";
import updateNotifier from "update-notifier";

import { parseArgs, runPrompts, getPackageJson } from "./cli";
import { generateProject, showProjectSummary } from "./generators";

// Check for updates (non-blocking, cached for 1 day)
const pkg = getPackageJson();
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 });

async function main() {
  console.clear();
  console.log();
  p.intro(pc.bold(pc.cyan("create-nextjs-dapp")));

  // Parse command-line arguments
  const cliOptions = parseArgs();

  // Run interactive prompts to gather remaining options
  const options = await runPrompts(cliOptions);

  // Generate the project
  await generateProject({
    projectName: options.projectName,
    projectPath: options.projectPath,
    chain: options.chain,
    wallet: options.wallet,
    git: options.git,
    install: options.install,
    packageManager: options.packageManager,
  });

  // Show project summary and next steps
  showProjectSummary(
    options.chain,
    options.wallet,
    options.projectPath,
    options.projectName,
    options.packageManager,
    options.install
  );

  p.outro(
    pc.bold(pc.green("✨ Happy building!")) +
      pc.dim(" — Star us on GitHub: github.com/0xmihirsahu/create-nextjs-dapp")
  );

  // Show update notification if available (after all output)
  notifier.notify({
    isGlobal: true,
    message: `Update available: ${pc.dim("{currentVersion}")} → ${pc.green("{latestVersion}")}\nRun ${pc.cyan("npm i -g create-nextjs-dapp")} to update`,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
