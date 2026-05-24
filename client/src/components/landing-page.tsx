"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Sun, Moon, Bird, ArrowRight, Users, Image, Bell, MessageCircle,
  Shield, Zap, Globe, Star, ChevronRight, CheckCircle2
} from "lucide-react"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

export function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const goToAuth = (tab?: string) => router.push(`/?auth=true${tab ? `&tab=${tab}` : ""}`)

  const features = [
    { icon: Users, title: "Follow & Connect", desc: "Build your network by following people who inspire you." },
    { icon: Image, title: "Share Moments", desc: "Post photos and thoughts with your community instantly." },
    { icon: Bell, title: "Real-time Notifications", desc: "Never miss a like, comment, or new follower." },
    { icon: MessageCircle, title: "Comments & Reactions", desc: "Engage with content you care about." },
    { icon: Shield, title: "Privacy Controls", desc: "Control who can comment on your posts." },
    { icon: Globe, title: "Discover People", desc: "Explore and find new accounts to follow." },
  ]

  const stats = [
    { value: "10K+", label: "Active users" },
    { value: "50K+", label: "Posts shared" },
    { value: "99.9%", label: "Uptime" },
    { value: "< 100ms", label: "Response time" },
  ]

  const testimonials = [
    { name: "Priya Sharma", handle: "@priya_s", text: "SocialNest has completely replaced how I share my day. The UI is so clean and fast.", avatar: "P" },
    { name: "Arjun Mehta", handle: "@arjunm", text: "Finally a social app that doesn't feel cluttered. Love the minimal design.", avatar: "A" },
    { name: "Divya Nair", handle: "@divya_n", text: "The dark mode is gorgeous. I never want to leave this app.", avatar: "D" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── NAV ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <Bird className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="font-bold text-sm tracking-tight">SocialNest</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => goToAuth()}
              className="h-9 px-4 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              Sign in
            </button>
            <button
              onClick={() => goToAuth("register")}
              className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-85 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-secondary text-xs font-medium text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
          Now live — Join the community
          <ChevronRight className="w-3 h-3" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
          Share your story.
          <br />
          <span className="text-muted-foreground">Connect with the world.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          SocialNest is a modern social platform built for genuine connections —
          clean, fast, and distraction-free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => goToAuth("register")}
            className="flex items-center gap-2 h-12 px-7 rounded-2xl bg-foreground text-background font-semibold text-sm hover:opacity-85 active:scale-[0.98] transition-all shadow-lg shadow-foreground/10"
          >
            Create free account
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToAuth()}
            className="h-12 px-7 rounded-2xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent transition-all"
          >
            Sign in
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mt-10 text-xs text-muted-foreground">
          <div className="flex -space-x-2">
            {["S", "A", "D", "R", "P"].map((l, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[9px] font-bold">
                {l}
              </div>
            ))}
          </div>
          <span>Join 10,000+ people already on SocialNest</span>
        </div>
      </section>

      {/* ─── APP PREVIEW ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="border border-border/60 rounded-3xl overflow-hidden bg-card shadow-2xl shadow-foreground/5">
          {/* Mock browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-secondary/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
            </div>
            <div className="flex-1 mx-4 h-6 bg-background rounded-lg border border-border/60 flex items-center px-3">
              <span className="text-[11px] text-muted-foreground/60">app.socialnest.co</span>
            </div>
          </div>

          {/* Mock app UI */}
          <div className="flex h-72 md:h-96">
            {/* Mock sidebar */}
            <div className="w-44 border-r border-border/60 p-3 hidden md:block">
              <div className="flex items-center gap-2 px-2 py-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-foreground flex items-center justify-center">
                    <Bird className="w-3 h-3 text-background" />
                  </div>
                <span className="text-xs font-bold">SocialNest</span>
              </div>
              {["Home", "Explore", "Profile", "Settings"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 ${i === 0 ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                  <div className="w-3 h-3 rounded bg-current opacity-60" />
                  <span className="text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Mock feed */}
            <div className="flex-1 p-4 overflow-hidden">
              {[
                { name: "Priya Sharma", handle: "priya_s", hasImage: true, text: "Beautiful sunset from Coorg today! 🌅", likes: 42, comments: 8 },
                { name: "Arjun Mehta", handle: "arjunm", hasImage: false, text: "Just shipped a new feature at work. Feels amazing when the code just works! 🚀", likes: 118, comments: 23 },
              ].map((post, i) => (
                <div key={i} className="bg-background border border-border/60 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                      {post.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-none">{post.name}</p>
                      <p className="text-[10px] text-muted-foreground">@{post.handle}</p>
                    </div>
                    <span className="ml-auto text-[10px] text-muted-foreground">2h ago</span>
                  </div>
                  <p className="text-xs text-foreground/80 mb-2">{post.text}</p>
                  {post.hasImage && <div className="h-20 rounded-lg bg-secondary/50 mb-2 border border-border/40" />}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1 text-[10px]"><span>♡</span> {post.likes}</span>
                    <span className="flex items-center gap-1 text-[10px]"><MessageCircle className="w-2.5 h-2.5" /> {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────── */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Everything you need.</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">A complete social platform with all the features that matter, and nothing that doesn't.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-foreground/20 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-4.5 h-4.5 text-background" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────── */}
      <section className="border-t border-border/60 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Loved by our community</h2>
            <p className="text-muted-foreground text-sm">Real words from real people.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map(({ name, handle, text, avatar }) => (
              <div key={name} className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
                <p className="text-sm leading-relaxed text-foreground/80">"{text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-28 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to join?
          </h2>
          <p className="text-muted-foreground mb-10 text-sm max-w-sm mx-auto">
            It's free, always. Create your account in less than 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={() => goToAuth("register")}
              className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-foreground text-background font-semibold text-sm hover:opacity-85 active:scale-[0.98] transition-all shadow-lg shadow-foreground/10"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {["Free forever", "No credit card", "Ready in 60 seconds"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Bird className="w-3 h-3 text-background" />
            </div>
            <span className="font-bold text-sm">SocialNest</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SocialNest. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}
