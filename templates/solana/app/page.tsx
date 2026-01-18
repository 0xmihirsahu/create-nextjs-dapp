import { WalletStatus } from "@/components/WalletStatus";

const Home = () => {
  return (
    <main className="min-h-[calc(100vh-65px)] flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="text-xl md:text-2xl font-medium text-foreground mb-2">
            solana dapp
          </h1>
          <p className="text-sm text-muted-foreground">
            connect your wallet to get started
          </p>
        </div>
        <WalletStatus />
      </div>

      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>built with next.js + solana</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            view source →
          </a>
        </div>
      </footer>
    </main>
  );
};

export default Home;
