"use client";

import { useActiveAccount, useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useMemo } from "react";
import { client } from "../lib/client";

const WalletStatus = () => {
  const account = useActiveAccount();
  const { connect } = useConnect();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com"),
    []
  );

  useEffect(() => {
    if (account?.address) {
      setLoading(true);
      try {
        const pubkey = new PublicKey(account.address);
        connection
          .getBalance(pubkey)
          .then((bal) => {
            setBalance(bal / LAMPORTS_PER_SOL);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setBalance(null);
    }
  }, [account?.address]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    connect(async () => {
      const wallet = createWallet("app.phantom");
      await wallet.connect({ client });
      return wallet;
    });
  };

  const connected = !!account;

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

        {connected && account ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">address</div>
              <div className="text-lg font-medium text-foreground font-mono">
                {formatAddress(account.address)}
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
          <div className="space-y-3">
            <div className="text-muted-foreground">
              connect your wallet to view balance
            </div>
            <button
              onClick={handleConnect}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              connect wallet to continue →
            </button>
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
          <p>This is a Solana dApp starter template with Thirdweb. You can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Connect your Phantom or other Solana wallet</li>
            <li>Use Thirdweb&apos;s full-stack web3 tools</li>
            <li>View your SOL balance on devnet</li>
            <li>Extend this template to interact with Solana programs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { WalletStatus };
