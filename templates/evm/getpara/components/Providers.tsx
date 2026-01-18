"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ParaProvider, Environment } from "@getpara/react-sdk";
import { ThemeProvider } from "next-themes";
import { sepolia } from "wagmi/chains";
import "@getpara/react-sdk/styles.css";

const queryClient = new QueryClient();

const apiKey = process.env.NEXT_PUBLIC_PARA_API_KEY || "";

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

const Providers = ({ children }: { children: ReactNode }) => {
  if (!apiKey) {
    console.warn(
      "Missing NEXT_PUBLIC_PARA_API_KEY. Get one at https://developer.getpara.com/"
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ParaProvider
        paraClientConfig={{
          apiKey,
          environment: Environment.BETA,
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </ParaProvider>
    </ThemeProvider>
  );
};

export { Providers };
