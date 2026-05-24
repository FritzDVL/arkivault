import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Zap, ArrowRight, Github, Twitter, Send, Database, Wallet, Smartphone, ShieldCheck, Key } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import ObsidianLogo from "@assets/obsidian-logo.svg";
import ArkivLogo from "@assets/arkiv-logo.svg";

const queryClient = new QueryClient();

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Home() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Waitlist joined.",
      description: "We'll notify you when the vault opens.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans overflow-x-hidden selection:bg-accent selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-border/50 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={ObsidianLogo} alt="Obsidian" className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight">On-Chain Second Brain</span>
            <span className="hidden md:inline-block text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border rounded-sm px-1.5 py-0.5 ml-1">Obsidian Plugin</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#architecture" className="hidden md:block hover:text-primary transition-colors font-mono uppercase text-xs">Architecture</a>
            <a href="#features" className="hidden md:block hover:text-primary transition-colors font-mono uppercase text-xs">Features</a>
            <a href="https://arkiv.network" target="_blank" rel="noreferrer" className="hidden md:block hover:text-primary transition-colors font-mono uppercase text-xs">Arkiv L3</a>
            <Button variant="outline" className="border-border hover:bg-secondary rounded-sm h-8 px-4 font-mono text-xs uppercase" onClick={() => document.getElementById("waitlist")?.scrollIntoView({behavior: "smooth"})}>
              Early Access
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-background"></div>
        <div className="absolute inset-0 -z-10 bg-[url('/src/assets/images/vault-bg.png')] bg-cover bg-center opacity-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        
        <div className="max-w-5xl mx-auto mt-16 md:mt-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-accent/30 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              ETHGlobal Hackathon Submission
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              ON-CHAIN <br />
              <span className="text-primary">SECOND BRAIN.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Your notes live on-chain, owned by your wallet, encrypted by your key. 
              <span className="block mt-2 font-mono text-sm text-foreground bg-secondary/50 p-2 rounded border border-border inline-block">
                NO AWS • NO SUPABASE • NO FIREBASE • NO CENTRAL DATABASE
              </span>
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
              <form onSubmit={handleJoinWaitlist} className="flex gap-2 max-w-md w-full">
                <Input 
                  type="email" 
                  placeholder="wallet@domain.eth" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-sm border-border bg-white h-12 focus-visible:ring-primary font-mono"
                  required
                />
                <Button type="submit" className="h-12 rounded-sm bg-primary hover:bg-primary/90 text-white px-8 font-mono uppercase text-sm">
                  Init Vault
                </Button>
              </form>
            </motion.div>
            
            <motion.div variants={fadeIn} className="pt-4 flex items-center gap-6 text-sm text-muted-foreground font-mono">
              <a href="https://arkiv.network" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors group">
                Read the Arkiv Litepaper <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 px-6 bg-[#0a0a0a] text-white border-y border-[#333]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-mono text-primary mb-2 uppercase tracking-widest">How It Works</h2>
            <h3 className="text-3xl md:text-4xl font-bold">ARKIV IS THE DATABASE</h3>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Every device reads and writes directly to the Arkiv L3 via RPC. There is no backend in between. Zero cloud infrastructure cost.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-12 w-full overflow-x-auto pb-8">
              <div className="min-w-[800px] font-mono text-sm md:text-base leading-tight p-8 bg-[#111] border border-[#333] rounded shadow-2xl flex justify-center text-gray-300 whitespace-pre">
{`
┌──────────────────┐                ┌───────────────────┐                ┌──────────────────┐
│                  │                │                   │                │                  │
│  Laptop / Vault  │ ◄────────────► │ ARKIV L3 DB-CHAIN │ ◄────────────► │   Mobile / Web   │
│                  │  (RPC Network) │                   │  (RPC Network) │                  │
└──────────────────┘                └───────────────────┘                └──────────────────┘
   Local Markdown                     Universal Data Layer                 Decentralized View
`}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-lg">1. Write to Chain</h4>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Notes are encrypted locally with your private key, then written directly to the Arkiv network as Entities.
              </p>
              <div className="bg-[#111] border border-[#333] rounded overflow-hidden">
                <div className="px-4 py-2 bg-[#1a1a1a] border-b border-[#333] text-xs font-mono text-gray-500">
                  lib/sync.ts
                </div>
                <pre className="p-4 font-mono text-xs md:text-sm text-green-400 overflow-x-auto">
{`import { createPublicClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";

const arkiv = createPublicClient({ 
  chain: braga, 
  transport: http() 
});

await arkiv.arkiv.createEntity({
  payload: encrypt(note.markdown, userPrivateKey),
  attributes: { 
    category: "second-brain", 
    noteId: note.id 
  },
  expires_in: 2592000,
});`}
                </pre>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="h-5 w-5 text-accent" />
                <h4 className="font-bold text-lg">2. Read Anywhere</h4>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your phone or another app queries Arkiv directly. If it holds your keys, it can decrypt the payload.
              </p>
              <div className="bg-[#111] border border-[#333] rounded overflow-hidden">
                <div className="px-4 py-2 bg-[#1a1a1a] border-b border-[#333] text-xs font-mono text-gray-500">
                  lib/read.ts
                </div>
                <pre className="p-4 font-mono text-xs md:text-sm text-blue-400 overflow-x-auto">
{`const result = await arkiv.buildQuery()
  .where(eq("category", "second-brain"))
  .ownedBy(myWalletAddress)
  .withPayload(true)
  .fetch();

// Parse entities and decrypt
const notes = result.entities.map(e => 
  decrypt(e.payload, userPrivateKey)
);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Pillars / Manifesto */}
      <section id="manifesto" className="py-24 px-6 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto space-y-24">
          
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 font-mono text-primary font-bold text-4xl">01.</div>
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-3xl font-bold">No Central Server.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Arkiv IS the database. Every device (laptop, phone, desktop) reads and writes directly to Arkiv via RPC. There is no backend in between. Zero cloud infrastructure cost for the developer. No API keys to leak, no servers to maintain.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 font-mono text-accent font-bold text-4xl">02.</div>
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-3xl font-bold">Bulletproof Private Vault.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Arkiv stores raw binary payloads. Your notes are encrypted with your private key on your laptop BEFORE they ever touch the chain. Only devices holding your key can decrypt and read them. Decentralized AND private — no node operator can read your thoughts.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 font-mono text-foreground font-bold text-4xl">03.</div>
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-3xl font-bold">Data Portability.</h2>
              <p className="text-muted-foreground leading-relaxed font-medium">
                The killer feature. If someone builds an AI mind-mapping tool next week, you don't export anything. You plug your wallet into their app, point it at Arkiv, and it reads your second brain natively. Your notes outlive any single app.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">SERVERLESS BY DESIGN</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Wallet className="h-6 w-6 text-primary" />}
              title="Wallet-Based Identity"
              description="No emails or passwords. Your wallet address is your identity, and your private key is the only way to decrypt your vault."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6 text-accent" />}
              title="Bulletproof Private Vault"
              description="E2E encrypted. Before a single byte leaves your device for sync, it is symmetrically encrypted. No one else can read it."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-yellow-500" />}
              title="Read from any device, instantly"
              description="RPC calls fetch your notes directly from the L3. Local caching means switching notes feels instant."
            />
            <FeatureCard 
              icon={<Database className="h-6 w-6 text-blue-500" />}
              title="Arkiv IS the Database"
              description="No rent to AWS. No Supabase. Sync relies entirely on the Arkiv Network — a decentralized data layer."
            />
            <FeatureCard 
              icon={<Key className="h-6 w-6 text-gray-700" />}
              title="Owned by your keys"
              description="Not our database. Your thoughts live on-chain and are fully portable to any other Arkiv-compatible application."
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6 text-green-600" />}
              title="Zero Lock-in"
              description="Data is standard markdown encrypted into binary payloads. It belongs to you forever, stored on unstoppable infrastructure."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="waitlist" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">CLAIM YOUR VAULT</h2>
          <p className="text-muted-foreground font-mono text-sm">Join the early access waitlist for the Obsidian plugin beta on the Arkiv Braga testnet.</p>
          
          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-4">
            <Input 
              type="email" 
              placeholder="wallet@domain.eth" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border-border bg-white h-12 text-center sm:text-left focus-visible:ring-primary font-mono"
              required
            />
            <Button type="submit" className="h-12 rounded-sm bg-accent hover:bg-accent/90 text-white px-8 font-mono uppercase text-sm">
              <Send className="h-4 w-4 mr-2" /> Submit
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-white text-sm font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src={ArkivLogo} alt="Arkiv" className="h-4 opacity-50 grayscale" />
            <span>Built during ETHGlobal.</span>
          </div>
          <div className="flex gap-6 text-muted-foreground">
            <a href="https://arkiv.network" className="hover:text-primary transition-colors">Arkiv L3</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-white border border-border rounded-md hover:border-primary/50 transition-colors group"
    >
      <div className="h-12 w-12 bg-secondary rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
