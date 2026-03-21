/**
 * AERO LANDING PAGE
 */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Chrome, Zap, Shield, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-md bg-foreground/20 border-b border-foreground/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Chrome size={20} className="text-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter">AERO</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login" className="px-5 py-2 hover:text-primary transition-all text-sm font-semibold">Login</Link>
                    <Link href="/signup" className="px-5 py-2 bg-white text-background rounded-lg font-bold text-sm hover:scale-105 transition-all">Get Started</Link>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="pt-48 pb-32 px-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                            Next-Generation Productivity
                        </span>
                        <h1 className="text-7xl font-black leading-[1.1] tracking-tighter gradient-text">
                            Master Your Time With <br />
                            AI-Powered Intelligence
                        </h1>
                        <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                            Stop guessing. AERO tracks, analyzes, and optimizes your digital life so you can focus on what actually matters.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link href="/signup" className="btn-primary px-10 py-5 rounded-2xl flex items-center gap-2 group">
                                Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-all" />
                            </Link>
                            <button className="px-10 py-5 bg-foreground/5 border border-foreground/10 rounded-2xl font-bold hover:bg-foreground/10 transition-all">
                                How it Works
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Features */}
                <section className="py-20 px-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-primary" size={32} />}
                            title="Instant Tracking"
                            desc="Real-time website monitoring with zero latency. Chrome extension integration makes it seamless."
                        />
                        <FeatureCard
                            icon={<Shield className="text-accent" size={32} />}
                            title="Focus Mode"
                            desc="Identify and block distractions intelligently. AERO learns your habits to keep you focused."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-secondary" size={32} />}
                            title="Neural Analytics"
                            desc="Go beyond basic charts. Get AI-driven insights into your peak performance hours."
                        />
                    </div>
                </section>
            </main>

            <footer className="py-20 text-center border-t border-foreground/5 text-muted text-sm italic">
                AERO Productivity Suite • 2026 • Designed for high-performers.
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="glass-card p-10 hover:border-primary/50 transition-all group">
            <div className="mb-6 group-hover:scale-110 transition-all">{icon}</div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-muted leading-relaxed">{desc}</p>
        </div>
    );
}

// Disable master layout for landing page (simulated)
LandingPage.noLayout = true;
