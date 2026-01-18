"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi";
import { createConfig, http } from "wagmi";
import { ThemeProvider } from "next-themes";
import { sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

const Providers = ({ children }: { children: ReactNode }) => {
  if (!appId) {
    console.warn(
      "Missing NEXT_PUBLIC_PRIVY_APP_ID. Get one at https://dashboard.privy.io/"
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <PrivyProvider
        appId={appId}
        config={{
          appearance: {
            theme: "dark",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          defaultChain: sepolia,
          supportedChains: [sepolia],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <PrivyWagmiConnector config={config}>
            <WagmiProvider config={config}>{children}</WagmiProvider>
          </PrivyWagmiConnector>
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
};

export { Providers };
