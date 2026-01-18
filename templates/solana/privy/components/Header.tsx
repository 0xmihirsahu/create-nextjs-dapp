"use client";

import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useSolanaWallets();
  const wallet = wallets[0];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

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
          {!ready ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              loading...
            </div>
          ) : !authenticated ? (
            <button
              onClick={login}
              className="px-4 py-2 text-sm border border-primary text-primary hover:bg-primary hover:text-black transition-colors"
            >
              connect wallet
            </button>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1.5 border border-border text-muted-foreground">
                devnet
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 border border-primary/50 text-primary hover:border-primary transition-colors"
              >
                {wallet ? formatAddress(wallet.address) : "connected"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
