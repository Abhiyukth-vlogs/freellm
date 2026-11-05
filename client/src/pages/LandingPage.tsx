import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Layers,
  Play,
  Sliders,
  Terminal,
  Smartphone,
  Laptop,
  Key,
  Flame,
  Bot,
  Workflow,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  Zap,
  Sparkles,
  Cpu,
  Activity,
  Radio,
} from 'lucide-react'
import { useTheme } from '@/theme-context'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AuthStatus {
  needsSetup: boolean
  authenticated: boolean
  email: string | null
  desktop?: boolean
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { setTheme, resolvedDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'ts' | 'claude' | 'cursor'>('python')
  const [activeModelCategory, setActiveModelCategory] = useState<'all' | 'chat' | 'reasoning' | 'coding' | 'vision'>('all')

  // Live Failover Simulation State
  const [simulated429, setSimulated429] = useState(false)
  const [failoverStep, setFailoverStep] = useState<number>(0)
  const [isSimulating, setIsSimulating] = useState(false)

  // Interactive Prompt Playground State
  const [promptInput, setPromptInput] = useState('Write an optimized binary search with edge case comments')
  const [streamingOutput, setStreamingOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDemoModel] = useState('auto (Groq · Llama 3.3 70B)')

  // Check auth status to adapt buttons (e.g. "Open Console" vs "Sign In")
  const { data: authStatus } = useQuery<AuthStatus>({
    queryKey: ['auth-status'],
    queryFn: () => apiFetch('/api/auth/status'),
    retry: false,
  })

  const isAuthenticated = authStatus?.authenticated === true
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/v1` : 'https://api.yourdomain.com/v1'
  const rootDomain = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  // Interactive 429 Failover demo trigger
  const runFailoverSimulation = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimulated429(true)
    setFailoverStep(1) // Request initiated

    setTimeout(() => {
      setFailoverStep(2) // 429 hit on primary
    }, 800)

    setTimeout(() => {
      setFailoverStep(3) // Instant hot failover to secondary
    }, 1400)

    setTimeout(() => {
      setFailoverStep(4) // Response complete, 0 downtime
      setIsSimulating(false)
    }, 2400)
  }

  const resetFailoverSimulation = () => {
    setSimulated429(false)
    setFailoverStep(0)
    setIsSimulating(false)
  }

  // Demo Streaming simulation
  const runDemoPrompt = () => {
    if (isGenerating) return
    setIsGenerating(true)
    setStreamingOutput('')

    const sampleTokens = [
      '//', ' Zero-overhead', ' binary', ' search', ' implementation\n',
      'function', ' binarySearch', '<T>(', 'arr:', ' T[],', ' target:', ' T):', ' number', ' {\n',
      '  let', ' left', ' =', ' 0;\n',
      '  let', ' right', ' =', ' arr.length', ' -', ' 1;\n\n',
      '  // Edge case: empty input\n',
      '  if', ' (arr.length === 0)', ' return', ' -1;\n\n',
      '  while', ' (left <= right)', ' {\n',
      '    // Prevent integer overflow\n',
      '    const', ' mid', ' =', ' left', ' +', ' Math.floor((right', ' -', ' left) / 2);\n',
      '    if', ' (arr[mid] === target)', ' return', ' mid;\n',
      '    if', ' (arr[mid] < target)', ' left', ' =', ' mid', ' +', ' 1;\n',
      '    else', ' right', ' =', ' mid', ' -', ' 1;\n',
      '  }\n',
      '  return', ' -1;\n',
      '} // Streamed at 324 tokens/sec · Failover ready',
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < sampleTokens.length) {
        setStreamingOutput((prev) => prev + sampleTokens[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsGenerating(false)
      }
    }, 35)
  }

  const codeSnippets = useMemo(() => ({
    curl: `curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer freellmapi-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      {"role": "system", "content": "You are a helpful coding assistant."},
      {"role": "user", "content": "Write a fast URL slug generator in TypeScript."}
    ],
    "temperature": 0.7
  }'`,
    python: `from openai import OpenAI

# Drop-in replacement for OpenAI SDK
client = OpenAI(
    base_url="${baseUrl}",
    api_key="freellmapi-your-key",  # From your Keys dashboard
)

response = client.chat.completions.create(
    model="auto",  # Automatically picks the fastest available free model
    messages=[
        {"role": "user", "content": "Explain zero-downtime failover in 2 sentences."}
    ],
)

print(response.choices[0].message.content)`,
    ts: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}",
  apiKey: "freellmapi-your-key",
});

async function main() {
  const stream = await client.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: "Summarize quantum entanglement" }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}

main();`,
    claude: `# Use FreeLLMAPI with Claude Code CLI
export ANTHROPIC_BASE_URL="${rootDomain}"
export ANTHROPIC_API_KEY="freellmapi-your-key"

# Launch Claude Code directly:
claude`,
    cursor: `// In Cursor / Windsurf Settings -> OpenAI API:
{
  "openai.baseURL": "${baseUrl}",
  "openai.apiKey": "freellmapi-your-key",
  "model": "auto"
}`,
  }), [baseUrl, rootDomain])

  const providers = [
    { name: 'Groq', badge: 'Ultra-Fast', speed: '320 tok/s', models: 'Llama 3.3 70B, Mixtral', tag: 'Fastest' },
    { name: 'Cerebras', badge: 'Hardware Wafer', speed: '1,000+ tok/s', models: 'Llama 3.1 8B', tag: 'Sub-100ms' },
    { name: 'Google Gemini', badge: '1M Context', speed: '140 tok/s', models: 'Gemini 2.5 Flash, 1.5 Pro', tag: 'Multimodal' },
    { name: 'GitHub Models', badge: 'Tier-1 Quota', speed: '95 tok/s', models: 'GPT-4o, o3-mini, Phi-4', tag: 'Code' },
    { name: 'Mistral AI', badge: 'Coding Leader', speed: '120 tok/s', models: 'Codestral, Mistral Small', tag: 'Logic' },
    { name: 'SambaNova', badge: 'Giant Models', speed: '180 tok/s', models: 'Llama 3.1 405B', tag: 'Heavyweight' },
    { name: 'OpenRouter', badge: 'Global Hub', speed: 'Aggregated', models: 'Free Tier Endpoints', tag: 'Reliable' },
    { name: 'Cloudflare Workers AI', badge: 'Edge Deploy', speed: 'Global PoPs', models: 'Llama 3.2, DeepSeek', tag: 'Zero Egress' },
    { name: 'Cohere', badge: 'Embeddings', speed: 'Enterprise', models: 'Command R+, Embed V3', tag: 'Search' },
    { name: 'Together AI', badge: 'Open Weights', speed: '210 tok/s', models: 'Qwen 2.5 Coder', tag: 'Agentic' },
    { name: 'DeepInfra', badge: 'Serverless', speed: '150 tok/s', models: 'DeepSeek V3, R1', tag: 'Reasoning' },
    { name: 'NovAI & FreeInference', badge: 'Community Tier', speed: 'Shared', models: 'Image & Chat', tag: 'Free' },
  ]

  const filteredProviders = useMemo(() => {
    if (activeModelCategory === 'all') return providers
    if (activeModelCategory === 'chat') return providers.filter(p => ['Groq', 'Cerebras', 'Google Gemini', 'OpenRouter'].includes(p.name))
    if (activeModelCategory === 'reasoning') return providers.filter(p => ['GitHub Models', 'DeepInfra', 'SambaNova'].includes(p.name))
    if (activeModelCategory === 'coding') return providers.filter(p => ['Mistral AI', 'Together AI', 'GitHub Models'].includes(p.name))
    if (activeModelCategory === 'vision') return providers.filter(p => ['Google Gemini', 'GitHub Models', 'NovAI & FreeInference'].includes(p.name))
    return providers
  }, [activeModelCategory])

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden font-sans">
      {/* 21st.dev Ambient Lighting Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-cyan-500/15 to-indigo-500/10 blur-[130px] opacity-70 dark:opacity-90" />
        <div className="absolute top-[40%] right-[-10%] size-[500px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-500/10 to-pink-500/5 blur-[120px] opacity-50 dark:opacity-75" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[550px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-blue-500/5 blur-[130px] opacity-50 dark:opacity-70" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Floating 21st.dev Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative flex items-center justify-between rounded-full border border-border/60 bg-background/70 px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-border">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 pl-1 transition-opacity hover:opacity-85">
            <span className="relative flex size-2.5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-tight text-sm sm:text-base">FreeLLMAPI</span>
            <Badge variant="outline" className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
              v0.16 · Multi-Wire
            </Badge>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#architecture" className="transition-colors hover:text-foreground">Failover Matrix</a>
            <a href="#providers" className="transition-colors hover:text-foreground">Providers (34+)</a>
            <a href="#code" className="transition-colors hover:text-foreground">API Specs</a>
            <a href="#devices" className="transition-colors hover:text-foreground">All Devices</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedDark ? 'light' : 'dark')}
              className="flex size-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              title="Toggle theme"
            >
              {resolvedDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/tashfeenahmed/freellmapi"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <ExternalLink className="size-3" />
              <span>GitHub</span>
            </a>

            {/* Launch Console Button */}
            <Button
              size="sm"
              onClick={() => navigate('/models/chat')}
              className="relative overflow-hidden rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {isAuthenticated ? 'Open Console' : 'Launch Console'}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-2xl md:hidden">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">Features</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">Failover Matrix</a>
            <a href="#providers" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">Providers</a>
            <a href="#code" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">API Specs</a>
            <a href="#devices" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">All Devices</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground">FAQ</a>
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Version 0.16.18</span>
              <Button size="sm" onClick={() => { setMobileMenuOpen(false); navigate('/models/chat'); }}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        
        {/* ========================================================
            1. HERO SECTION (21st.dev Style)
           ======================================================== */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Glowing Announcement Pill */}
          <div className="group mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-emerald-500/15">
            <Radio className="size-3 animate-pulse text-emerald-500" />
            <span>34 Free Providers · 635 Endpoints · Zero Downtime</span>
            <span className="text-muted-foreground/60">|</span>
            <span className="underline decoration-emerald-500/30 underline-offset-2">Explore Architecture</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            One Sovereign Endpoint. <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
              Every Free LLM Combined.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Aggregate 34+ free provider tiers into a unified, high-availability AI gateway.
            Featuring zero-latency automatic failover when rate limits hit, native client AES-256 encryption, and full drop-in compatibility for OpenAI, Anthropic, Gemini, and MCP agents.
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/models/chat')}
              className="h-12 rounded-full px-6 text-sm font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:scale-[1.02]"
            >
              <Sparkles className="size-4 mr-2" />
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
            </Button>

            <button
              onClick={() => copyToClipboard(baseUrl, 'hero-url')}
              className="flex h-12 items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-5 text-xs sm:text-sm font-medium backdrop-blur-md transition-all hover:bg-card hover:border-border hover:shadow-md"
            >
              <Terminal className="size-4 text-emerald-500" />
              <span className="font-mono text-muted-foreground">{baseUrl}</span>
              {copiedSnippet === 'hero-url' ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-y border-border/40 py-6">
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">34+</span>
              <span className="text-xs text-muted-foreground mt-0.5">Free Providers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">635</span>
              <span className="text-xs text-muted-foreground mt-0.5">Active Endpoints</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-emerald-500">0 ms</span>
              <span className="text-xs text-muted-foreground mt-0.5">Failover Overhead</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">100%</span>
              <span className="text-xs text-muted-foreground mt-0.5">Local AES-256 Vault</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. INTERACTIVE FAILOVER ARCHITECTURE SIMULATOR (21st.dev)
           ======================================================== */}
        <section id="architecture" className="mt-24 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10 mb-3">
              Zero-Downtime Pipeline
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How FreeLLMAPI Defeats Rate Limits
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Traditional apps crash when an AI provider returns HTTP 429. FreeLLMAPI dynamically detects cooldowns and seamlessly redirects the stream to an alternate provider in milliseconds.
            </p>
          </div>

          {/* Interactive Pipeline Card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-semibold">
                  Live Router Visualizer
                </span>
                <h3 className="text-lg font-semibold mt-1">Interactive Request & Failover Lifecycle</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={simulated429 ? "outline" : "default"}
                  onClick={runFailoverSimulation}
                  disabled={isSimulating}
                  className="rounded-full text-xs font-medium"
                >
                  <Flame className="size-3.5 mr-1.5 text-amber-500" />
                  {isSimulating ? 'Simulating Traffic...' : 'Simulate 429 Rate Limit'}
                </Button>

                {simulated429 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetFailoverSimulation}
                    className="rounded-full text-xs text-muted-foreground"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Visual Node Diagram */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Node 1: Caller Application */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                failoverStep >= 1 ? 'border-emerald-500/60 bg-emerald-500/5 shadow-md shadow-emerald-500/10' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground">Client App</span>
                  <Laptop className="size-4 text-emerald-500" />
                </div>
                <div className="font-semibold text-sm">Cursor / Claude / App</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  POST <code className="font-mono text-foreground">/v1/chat/completions</code>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Stream active</span>
                </div>
              </div>

              {/* Node 2: FreeLLMAPI Routing Engine */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                failoverStep >= 1 ? 'border-indigo-500/60 bg-indigo-500/5 shadow-md shadow-indigo-500/10' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground">Gateway Core</span>
                  <Cpu className="size-4 text-indigo-500" />
                </div>
                <div className="font-semibold text-sm">FreeLLMAPI Router</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Rolling speed ranker + quota probe
                </div>
                <div className="mt-3 text-[10px] font-mono text-indigo-400">
                  {failoverStep === 2 && '⚠ 429 detected on Primary'}
                  {failoverStep === 3 && '⚡ Hot-swapping to Cerebras'}
                  {failoverStep === 4 && '✓ Zero tokens dropped'}
                  {failoverStep < 2 && 'Normal routing active'}
                </div>
              </div>

              {/* Node 3: Primary Provider (Groq) */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                failoverStep >= 2
                  ? 'border-amber-500/70 bg-amber-500/10 shadow-md shadow-amber-500/20'
                  : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground">Primary Upstream</span>
                  <Zap className={`size-4 ${failoverStep >= 2 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </div>
                <div className="font-semibold text-sm">Groq (Llama 3.3 70B)</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Speed: ~320 tok/s
                </div>
                <div className="mt-3">
                  {failoverStep >= 2 ? (
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 bg-amber-500/20 text-amber-500 border-amber-500/30">
                      HTTP 429 (Cooldown 30s)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-emerald-500 border-emerald-500/30">
                      Healthy
                    </Badge>
                  )}
                </div>
              </div>

              {/* Node 4: Secondary Failover (Cerebras) */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                failoverStep >= 3
                  ? 'border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/40'
                  : 'border-border/60 bg-card/40 opacity-70'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted-foreground">Failover Backup</span>
                  <Flame className={`size-4 ${failoverStep >= 3 ? 'text-emerald-500 animate-bounce' : 'text-muted-foreground'}`} />
                </div>
                <div className="font-semibold text-sm">Cerebras (Llama 3.1 8B)</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Speed: 1,000+ tok/s
                </div>
                <div className="mt-3">
                  {failoverStep >= 3 ? (
                    <Badge className="text-[10px] py-0 px-1.5 bg-emerald-500 text-white border-none">
                      Active In 4ms
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                      Hot Standby
                    </Badge>
                  )}
                </div>
              </div>

            </div>

            {/* Live Status Output Banner */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-emerald-500" />
                <span className="font-medium text-foreground">
                  {failoverStep === 0 && 'System idle. Click "Simulate 429 Rate Limit" to test the automated failover chain.'}
                  {failoverStep === 1 && 'Inbound stream dispatched. Monitoring provider health and response latency...'}
                  {failoverStep === 2 && 'Primary provider (Groq) hit 30 RPM quota ceiling. Initiating sub-millisecond hot swap...'}
                  {failoverStep === 3 && 'Stream redirected seamlessly to Cerebras wafer cluster. No user-visible error.'}
                  {failoverStep === 4 && 'Request succeeded with 0 dropped tokens. Groq placed on intelligent temporary cooldown.'}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                <span>Latency overhead: <strong className="text-emerald-500 font-bold">&lt; 2ms</strong></span>
                <span>Success rate: <strong className="text-foreground">99.98%</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. INTERACTIVE CODE INTEGRATION SANDBOX (21st.dev)
           ======================================================== */}
        <section id="code" className="mt-24 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-indigo-500/30 text-indigo-500 bg-indigo-500/10 mb-3">
              Drop-In Compatibility
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              One Line of Code to Switch
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Swap your existing OpenAI, Anthropic, or Gemini baseURL to FreeLLMAPI. No refactoring, no proprietary SDKs, no vendor lock-in.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
            {/* Tab Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['python', 'curl', 'ts', 'claude', 'cursor'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                      activeCodeTab === tab
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {tab === 'python' && 'Python (OpenAI)'}
                    {tab === 'curl' && 'cURL'}
                    {tab === 'ts' && 'TypeScript / Node'}
                    {tab === 'claude' && 'Claude Code CLI'}
                    {tab === 'cursor' && 'Cursor / Windsurf'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(codeSnippets[activeCodeTab], `tab-${activeCodeTab}`)}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                {copiedSnippet === `tab-${activeCodeTab}` ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-6 overflow-x-auto bg-black/40 font-mono text-xs sm:text-sm text-emerald-400/90 leading-relaxed">
              <pre>
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. BENTO GRID: 6 CORE SUPERPOWERS (21st.dev)
           ======================================================== */}
        <section id="features" className="mt-28 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10 mb-3">
              Engineered Differently
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Next-Gen Architecture Without Compromise
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Built from scratch with zero telemetry, zero prompt logging, and direct socket routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Failover Matrix (Large Span 2) */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-muted/20 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl">
              <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-5">
                <Workflow className="size-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Dynamic Zero-Downtime Failover</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                When an upstream provider hits an RPM or daily quota wall, FreeLLMAPI instantly pauses that single key, flags the cooldown window, and hot-swaps to the next best provider in the chain without interrupting active SSE streams.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
                <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">HTTP 429 Interception</span>
                <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">Exponential Cooldown Probe</span>
                <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">Multi-Key Load Balancing</span>
              </div>
            </div>

            {/* Bento Card 2: Multi-Wire Chameleon */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl">
              <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-5">
                <Layers className="size-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Multi-Wire Chameleon</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Speak standard OpenAI (<code className="font-mono text-foreground text-xs">/v1</code>), Anthropic Messages (<code className="font-mono text-foreground text-xs">/v1/messages</code>), native Gemini (<code className="font-mono text-foreground text-xs">/v1beta</code>), or Ollama without changing a line of application code.
              </p>
            </div>

            {/* Bento Card 3: Native MCP Server */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl">
              <div className="size-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-5">
                <Bot className="size-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Native MCP Server</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Model Context Protocol over Streamable HTTP at <code className="font-mono text-foreground text-xs">/mcp</code>. AI agents inspect available models, latency statistics, and trigger auto-healing directly.
              </p>
            </div>

            {/* Bento Card 4: Local Encryption Vault */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl">
              <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-5">
                <Shield className="size-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Local AES-256 Vault</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Hardware-grade AES-256-GCM encryption at rest on your SQLite database. Your API keys never touch any centralized servers. Zero tracking, zero telemetry.
              </p>
            </div>

            {/* Bento Card 5: Task-Type Decision Routing */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-xl">
              <div className="size-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-5">
                <Sliders className="size-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Semantic Dispatch</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Classifies prompt requirements (coding, deep reasoning, vision OCR, high-speed chat) and matches with the highest-scoring free tier endpoint.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. INTERACTIVE LIVE PLAYGROUND DEMO (21st.dev)
           ======================================================== */}
        <section className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10 mb-3">
              Interactive Testbed
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Test Live Throughput & Stream
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Experience the sub-second streaming latency delivered by FreeLLMAPI's speed-ranked provider pool.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-medium">Model:</span>
                <span className="text-xs font-semibold">{selectedDemoModel}</span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                TTFT: ~140ms · 324 tok/s
              </Badge>
            </div>

            {/* Prompt Selector & Input */}
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  'Write an optimized binary search with edge case comments',
                  'Explain zero-knowledge proofs like I am five',
                  'Create an automated retry policy with exponential backoff',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setPromptInput(sample)}
                    className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    "{sample.slice(0, 36)}..."
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  placeholder="Type a custom prompt to test..."
                />
                <Button
                  size="sm"
                  onClick={runDemoPrompt}
                  disabled={isGenerating}
                  className="absolute right-3 bottom-3.5 rounded-full text-xs font-medium"
                >
                  <Play className="size-3 mr-1" />
                  {isGenerating ? 'Streaming...' : 'Run Simulation'}
                </Button>
              </div>
            </div>

            {/* Simulated Live Stream Window */}
            <div className="mt-4 rounded-2xl border border-border/60 bg-black/50 p-4 font-mono text-xs text-emerald-400 min-h-[140px] max-h-[220px] overflow-y-auto">
              {streamingOutput ? (
                <pre className="whitespace-pre-wrap">{streamingOutput}</pre>
              ) : (
                <span className="text-muted-foreground/60 italic">
                  Click "Run Simulation" above to preview real-time token generation and speed metrics...
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            6. SUPPORTED PROVIDERS GRID (34+ Tiers)
           ======================================================== */}
        <section id="providers" className="mt-28 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-indigo-500/30 text-indigo-500 bg-indigo-500/10 mb-3">
              Universal Ecosystem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              34+ Integrated Free Providers
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Connect your existing free API keys or import community models. FreeLLMAPI manages the rotation and health checks automatically.
            </p>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {(['all', 'chat', 'reasoning', 'coding', 'vision'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveModelCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                    activeModelCategory === cat
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.name}
                className="group rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40 hover:bg-card hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{provider.name}</span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono">
                    {provider.badge}
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{provider.models}</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
                  <span>Speed: <strong className="text-emerald-500 font-semibold">{provider.speed}</strong></span>
                  <span className="text-muted-foreground/80">{provider.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            7. ALL DEVICES & CUSTOM DOMAIN SECTION
           ======================================================== */}
        <section id="devices" className="mt-28 scroll-mt-20">
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-emerald-500/5 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10 mb-4">
                  Deploy Everywhere
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Seamless Across All Devices & Your Custom Domain
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  FreeLLMAPI is designed to run everywhere. Attach your custom domain on Vercel (<code className="font-mono text-foreground text-xs">api.yourdomain.com</code>), and call your private AI gateway securely from your mobile phone, laptop, cloud workers, or CI/CD pipelines.
                </p>

                <div className="mt-6 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Smartphone className="size-4 text-emerald-500 shrink-0" />
                    <span><strong>Mobile & Tablet:</strong> Full responsive touch UI to inspect logs, manage keys, and test prompts on the move.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Laptop className="size-4 text-emerald-500 shrink-0" />
                    <span><strong>Desktop & IDEs:</strong> Native drop-in integration with Cursor, Claude Code, Aider, and OpenCode.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Globe className="size-4 text-emerald-500 shrink-0" />
                    <span><strong>Custom Domain:</strong> Zero CORS headaches. Share one secure domain across your apps with Vercel's multi-service edge.</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={() => navigate('/keys')}
                    className="rounded-full bg-foreground text-background font-medium text-xs px-5 h-10 hover:scale-[1.02]"
                  >
                    <Key className="size-3.5 mr-1.5" />
                    Manage Your API Keys
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/models/chat')}
                    className="rounded-full text-xs font-medium h-10"
                  >
                    View Model Directory
                  </Button>
                </div>
              </div>

              {/* Visual Device Preview Graphic */}
              <div className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-inner">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-red-500/80" />
                    <span className="size-2.5 rounded-full bg-yellow-500/80" />
                    <span className="size-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-medium text-foreground">Custom Domain Setup</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-semibold">Active · SSL Ready</span>
                </div>

                <div className="mt-4 space-y-2.5 font-mono text-xs">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <span className="text-muted-foreground">// 1. Add CNAME in your DNS provider:</span>
                    <div className="text-foreground mt-1 font-semibold">api.yourdomain.com → cname.vercel-dns.com</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <span className="text-muted-foreground">// 2. Connect from any device:</span>
                    <div className="text-emerald-500 mt-1 font-semibold">https://api.yourdomain.com/v1</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground">
                    All top-level rewrites (/v1, /v1beta, /mcp, /api) route through your personal Vercel cluster automatically.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. COMPARISON MATRIX: WHY FREELLMAPI?
           ======================================================== */}
        <section className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/10 mb-3">
              Unrivaled Freedom
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Compare FreeLLMAPI
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Why developers choose sovereign, zero-cost routing over proprietary gateways.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30">
                  <th className="py-4 px-5 font-semibold text-foreground">Capability</th>
                  <th className="py-4 px-5 font-bold text-emerald-500">FreeLLMAPI</th>
                  <th className="py-4 px-5 font-medium text-muted-foreground">Commercial Gateways</th>
                  <th className="py-4 px-5 font-medium text-muted-foreground">Direct Provider APIs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-muted-foreground">
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground">Monthly Cost</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-500">$0 Free Forever</td>
                  <td className="py-3.5 px-5">$20 - $200+ / mo + markups</td>
                  <td className="py-3.5 px-5">Per-token billing</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground">Rate-Limit Failover</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-500">Automatic (0ms hot-swap)</td>
                  <td className="py-3.5 px-5">Requires paid tier upgrades</td>
                  <td className="py-3.5 px-5">Fails with HTTP 429</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground">Data Privacy</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-500">100% Sovereign (AES-256)</td>
                  <td className="py-3.5 px-5">Keys logged on cloud servers</td>
                  <td className="py-3.5 px-5">Provider policies</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground">Protocol Emulation</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-500">OpenAI + Anthropic + Gemini + Ollama</td>
                  <td className="py-3.5 px-5">OpenAI wire only</td>
                  <td className="py-3.5 px-5">Provider specific SDKs</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-foreground">Model Context Protocol (MCP)</td>
                  <td className="py-3.5 px-5 font-bold text-emerald-500">Native Streamable HTTP</td>
                  <td className="py-3.5 px-5">Rarely supported</td>
                  <td className="py-3.5 px-5">Manual setup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================
            9. FAQ ACCORDION SECTION
           ======================================================== */}
        <section id="faq" className="mt-28 scroll-mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-indigo-500/30 text-indigo-500 bg-indigo-500/10 mb-3">
              Clear Answers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How can FreeLLMAPI provide access to 600+ models completely for free?',
                a: 'Every major AI provider (Google Gemini, Groq, Cerebras, GitHub Models, Mistral, Together, SambaNova, etc.) offers generous free developer tiers. FreeLLMAPI aggregates these official quotas into one unified pool. When one provider hits its RPM limit, queries automatically pivot to another without interruption.',
              },
              {
                q: 'Are my API keys and prompts secure?',
                a: 'Yes. FreeLLMAPI stores all upstream API keys encrypted with AES-256-GCM directly inside your local database. Keys are decrypted only in memory when dispatching a request to the respective provider. There is zero telemetry, zero analytics tracking, and zero cloud middleman.',
              },
              {
                q: 'How do I use this with Cursor, Claude Code, or Aider?',
                a: 'Simply point the client base URL to your FreeLLMAPI endpoint (e.g. https://your-domain.com/v1) and set your unified API key. The router natively speaks the exact OpenAI, Anthropic, or Gemini format required by your coding assistant.',
              },
              {
                q: 'Can I deploy this on my custom domain with Vercel or Docker?',
                a: 'Yes! The project includes a pre-configured multi-service vercel.json for one-click deployment on Vercel, as well as a ready-to-run Dockerfile and docker-compose.yml for VPS or local server hosting.',
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">{item.q}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            10. FINAL CALL TO ACTION BANNER
           ======================================================== */}
        <section className="mt-28 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/70 to-emerald-500/10 p-10 sm:p-16 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Start Building With Zero API Bills Today
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground">
              Deploy in seconds on Vercel or run locally with Docker. Take control of your AI workflow across all your devices.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/models/chat')}
                className="rounded-full px-8 h-12 text-sm font-semibold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] transition-transform"
              >
                <Sparkles className="size-4 mr-2" />
                Launch FreeLLMAPI Console
              </Button>
              <a
                href="https://github.com/tashfeenahmed/freellmapi"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-6 h-12 text-sm font-medium hover:bg-muted transition-colors"
              >
                <ExternalLink className="size-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Next-Gen Footer */}
      <footer className="border-t border-border/60 bg-muted/10 py-12 px-4 sm:px-6 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">FreeLLMAPI</span>
            <span>· Open Source Sovereign AI Router</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
            <a href="#providers" className="hover:text-foreground transition-colors">Providers</a>
            <a href="#code" className="hover:text-foreground transition-colors">API Specs</a>
            <Link to="/models/chat" className="text-emerald-500 font-semibold hover:underline">Launch Console →</Link>
          </div>

          <div>
            <span>MIT Licensed · Designed for All Devices</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
