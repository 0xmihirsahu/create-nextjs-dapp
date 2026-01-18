"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            solana_starter
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};

export { Header };
