"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ThemeProvider } from "next-themes";
import { sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

const config = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "web3 starter",
  })
);

const Providers = ({ children }: { children: ReactNode }) => {
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    console.warn(
      "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Get one at https://cloud.walletconnect.com/"
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider mode="dark">{children}</ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export { Providers };
