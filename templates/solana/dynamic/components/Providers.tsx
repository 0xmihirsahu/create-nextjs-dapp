"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "";

const Providers = ({ children }: { children: ReactNode }) => {
  if (!environmentId) {
    console.warn(
      "Missing NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID. Get one at https://app.dynamic.xyz/"
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicContextProvider
        settings={{
          environmentId,
          walletConnectors: [SolanaWalletConnectors],
        }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </DynamicContextProvider>
    </ThemeProvider>
  );
};

export { Providers };
