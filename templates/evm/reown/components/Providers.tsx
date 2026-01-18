"use client";

import { ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { ThemeProvider } from "next-themes";
import { sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

let wagmiAdapter: WagmiAdapter | null = null;
let isAppKitInitialized = false;

function initializeAppKit() {
  if (isAppKitInitialized || !projectId) return;

  wagmiAdapter = new WagmiAdapter({
    networks: [sepolia],
    projectId,
    ssr: true,
  });

  createAppKit({
    adapters: [wagmiAdapter],
    networks: [sepolia],
    projectId,
    features: {
      analytics: true,
    },
    themeMode: "dark",
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

  if (!mounted || !wagmiAdapter) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export { Providers };
