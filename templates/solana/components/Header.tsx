"use client";

import { useWallet } from "@solana/wallet-adapter-react";
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
          <WalletMultiButton
            style={{
              backgroundColor: "transparent",
              border: "1px solid hsl(217, 91%, 60%)",
              color: "hsl(217, 91%, 60%)",
              borderRadius: "0px",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "14px",
              padding: "8px 16px",
              height: "auto",
            }}
          />
        </div>
      </div>
    </header>
  );
};

export { Header };
