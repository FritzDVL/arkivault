import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Terminal, Lock, Zap, FileJson, ArrowRight, Github, Twitter, Send } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
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
            <img src={ArkivLogo} alt="Arkiv" className="h-6" />
            <span className="font-bold text-lg tracking-tight">Arkivault</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#manifesto" className="hidden md:block hover:text-primary transition-colors">Manifesto</a>
            <a href="#features" className="hidden md:block hover:text-primary transition-colors">Features</a>
            <a href="https://arkiv.network" target="_blank" rel="noreferrer" className="hidden md:block hover:text-primary transition-colors">Powered by Arkiv</a>
            <Button variant="outline" className="border-border hover:bg-secondary rounded-sm h-8 px-4" onClick={() => document.getElementById("waitlist")?.scrollIntoView({behavior: "smooth"})}>
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
        
        <div className="max-w-4xl mx-auto mt-16 md:mt-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-accent/30 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              ETHGlobal Hackathon Submission
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              A SECOND BRAIN <br />
              <span className="text-primary">THAT OUTLIVES YOU.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Obsidian's craftsmanship meets the permanence of a public ledger. 
              Local-first markdown notes by default. Unstoppable decentralized sync via Arkiv by choice.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
              <form onSubmit={handleJoinWaitlist} className="flex gap-2 max-w-md w-full">
                <Input 
                  type="email" 
                  placeholder="name@domain.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-sm border-border bg-white h-12 focus-visible:ring-primary"
                  required
                />
                <Button type="submit" className="h-12 rounded-sm bg-primary hover:bg-primary/90 text-white px-8">
                  Join Waitlist
                </Button>
              </form>
            </motion.div>
            
            <motion.div variants={fadeIn} className="pt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://arkiv.network" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors group">
                Read the Arkiv Litepaper <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Terminal ASCII Visual */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full bg-[#111] border border-[#333] rounded-md overflow-hidden shadow-2xl"
          >
            <div className="h-8 border-b border-[#333] flex items-center px-4 gap-2 bg-[#1a1a1a]">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <div className="ml-2 text-[10px] text-gray-500 font-mono">arkivault-daemon</div>
            </div>
            <div className="p-6 font-mono text-xs md:text-sm text-green-400 overflow-x-auto leading-relaxed">
              <p className="text-gray-500">~ $ arkivault init</p>
              <p>[OK] Vault initialized at ~/.arkivault/main</p>
              <p>[OK] Local markdown engine ready. 0ms latency.</p>
              <p className="text-gray-500 mt-4">~ $ arkivault sync --network arkiv</p>
              <p className="text-blue-400">[i] Connecting to Arkiv decentralized data layer...</p>
              <p className="text-blue-400">[i] Establishing verifiable state channel...</p>
              <p>[OK] State anchored to Ethereum Sepolia.</p>
              <p className="text-accent mt-2">» Sync complete. Your thoughts are now unstoppable.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem / Manifesto */}
      <section id="manifesto" className="py-24 px-6 bg-white border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-muted-foreground line-through decoration-destructive decoration-2">
                Cloud is rented.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Modern note apps hold your thoughts hostage. They lock your data in proprietary databases, charge monthly rent to access it, and can disappear overnight taking your second brain with them.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-primary">
                Local is yours.
              </h2>
              <p className="text-foreground leading-relaxed font-medium">
                Arkivault stores your notes as plain markdown files on your hard drive. They open instantly. They work offline. You can edit them with any text editor. But when you need sync, we don't rely on AWS. We rely on math.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">UNCOMPROMISING ARCHITECTURE</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Terminal className="h-6 w-6 text-primary" />}
              title="Markdown First"
              description="No lock-in. Your notes are standard .md files sitting in a standard folder. View them in Obsidian, VS Code, or Arkivault."
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6 text-accent" />}
              title="E2E Encrypted"
              description="Before a single byte leaves your device for sync, it is symmetrically encrypted. Only you hold the keys."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-yellow-500" />}
              title="Zero Latency"
              description="Because the app reads from your local disk, switching notes takes less than 1ms. Sync happens entirely in the background."
            />
            <FeatureCard 
              icon={<FileJson className="h-6 w-6 text-blue-500" />}
              title="Arkiv DB Sync"
              description="Instead of central servers, sync relies on Arkiv Network — a decentralized data layer anchored to Ethereum."
            />
            <FeatureCard 
              icon={<Github className="h-6 w-6 text-gray-700" />}
              title="Open Source"
              description="The entire client and the underlying Arkiv network protocols are open source. Verify the cryptography yourself."
            />
          </div>
        </div>
      </section>

      {/* Arkiv Explanation */}
      <section className="py-24 px-6 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('/src/assets/images/note-graph.png')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">POWERED BY ARKIV</h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Arkivault isn't just another note-taking app. It's a showcase for the <span className="text-white font-bold">Arkiv Network</span>.
            By utilizing a decentralized data layer for Ethereum (formerly Golem DB), Arkivault proves that consumer-grade apps can run entirely on unstoppable, decentralized infrastructure.
          </p>
          <div className="pt-6">
            <a href="https://arkiv.network" target="_blank" rel="noreferrer">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary rounded-sm h-12 px-8">
                Explore Arkiv Protocol
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="waitlist" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">CLAIM YOUR VAULT</h2>
          <p className="text-muted-foreground">Join the early access waitlist to try the Arkivault beta.</p>
          
          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-4">
            <Input 
              type="email" 
              placeholder="name@domain.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border-border bg-white h-12 text-center sm:text-left focus-visible:ring-primary"
              required
            />
            <Button type="submit" className="h-12 rounded-sm bg-accent hover:bg-accent/90 text-white px-8">
              <Send className="h-4 w-4 mr-2" /> Submit
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-white text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src={ArkivLogo} alt="Arkiv" className="h-4 opacity-50 grayscale" />
            <span>Built during ETHGlobal.</span>
          </div>
          <div className="flex gap-6 text-muted-foreground">
            <a href="https://arkiv.network" className="hover:text-primary transition-colors">Arkiv Network</a>
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
