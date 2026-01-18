"use client";

import { ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

let isAppKitInitialized = false;

function initializeAppKit() {
  if (isAppKitInitialized || !projectId) return;

  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
  });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solanaDevnet, solana],
    projectId,
    features: {
      analytics: true,
    },
    themeMode: "dark",
    themeVariables: {
      "--w3m-font-family": "var(--font-mono), ui-monospace, monospace",
      "--w3m-accent": "hsl(217, 91%, 60%)",
      "--w3m-border-radius-master": "0px",
    },
  });

  isAppKitInitialized = true;
}

const Providers = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!projectId) {
      console.warn(
        "Missing NEXT_PUBLIC_REOWN_PROJECT_ID. Get one at https://cloud.reown.com/"
      );
    } else {
      initializeAppKit();
    }
    setMounted(true);
  }, []);

  if (!projectId) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6 border border-border">
            <p className="text-muted-foreground mb-2">Missing configuration</p>
            <p className="text-sm text-muted-foreground">
              Add NEXT_PUBLIC_REOWN_PROJECT_ID to your .env file
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!mounted) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

export { Providers };
