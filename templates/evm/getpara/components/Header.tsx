"use client";

import { ParaModal, useModal } from "@getpara/react-sdk";
import { useAccount, useDisconnect } from "wagmi";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const { openModal } = useModal();
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            web3_starter
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!address ? (
            <button
              onClick={openModal}
              className="px-4 py-2 text-sm border border-primary text-primary hover:bg-primary hover:text-black transition-colors"
            >
              connect wallet
            </button>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              {chain && (
                <span className="px-3 py-1.5 border border-border text-muted-foreground">
                  {chain.name?.toLowerCase()}
                </span>
              )}
              <button
                onClick={() => disconnect()}
                className="px-3 py-1.5 border border-primary/50 text-primary hover:border-primary transition-colors"
              >
                {formatAddress(address)}
              </button>
            </div>
          )}
        </div>
      </div>
      <ParaModal />
    </header>
  );
};

export { Header };
