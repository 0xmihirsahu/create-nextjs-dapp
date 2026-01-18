"use client";

import {
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

const connection = new Connection("https://api.devnet.solana.com");

const WalletStatus = () => {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const solanaWallet = userWallets.find((w) => w.chain === "SOL");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (solanaWallet?.address) {
      setLoading(true);
      const pubkey = new PublicKey(solanaWallet.address);
      connection
        .getBalance(pubkey)
        .then((bal) => {
          setBalance(bal / LAMPORTS_PER_SOL);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setBalance(null);
    }
  }, [solanaWallet?.address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const connected = !!solanaWallet;

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

        {connected && solanaWallet ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">address</div>
              <div className="text-lg font-medium text-foreground font-mono">
                {formatAddress(solanaWallet.address)}
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
              onClick={() => setShowAuthFlow(true)}
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
          <p>This is a Solana dApp starter template with Dynamic. You can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Connect your Phantom, Solflare, or other Solana wallet</li>
            <li>Login with email or social and get an embedded wallet</li>
            <li>View your SOL balance on devnet</li>
            <li>Extend this template to interact with Solana programs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { WalletStatus };
