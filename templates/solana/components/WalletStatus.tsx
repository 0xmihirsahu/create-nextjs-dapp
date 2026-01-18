"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

const WalletStatus = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && connected) {
      setLoading(true);
      connection
        .getBalance(publicKey)
        .then((bal) => {
          setBalance(bal / LAMPORTS_PER_SOL);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setBalance(null);
    }
  }, [publicKey, connected, connection]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {/* Wallet Status Card */}
      <div className="p-6 border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-muted-foreground"}`}
          />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {connected ? "connected" : "not connected"}
          </span>
        </div>

        {connected && publicKey ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">address</div>
              <div className="text-lg font-medium text-foreground font-mono">
                {formatAddress(publicKey.toBase58())}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">balance</div>
              <div className="text-2xl md:text-3xl font-medium text-foreground">
                {loading ? (
                  <span className="animate-pulse">loading...</span>
                ) : balance !== null ? (
                  `${balance.toFixed(4)} SOL`
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            connect your wallet to view balance
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="p-6 border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            getting started
          </span>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>This is a Solana dApp starter template. You can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Connect your Phantom, Solflare, or other Solana wallet</li>
            <li>View your SOL balance</li>
            <li>
              Extend this template to interact with Solana programs (smart
              contracts)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { WalletStatus };
