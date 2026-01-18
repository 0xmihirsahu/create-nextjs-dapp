"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

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
            accentColor: "#3b82f6",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          solanaClusters: [
            {
              name: "devnet",
              rpcUrl: "https://api.devnet.solana.com",
            },
          ],
        }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
};

export { Providers };
