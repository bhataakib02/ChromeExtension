"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { Chrome, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        const res = await register(name, email, password);
        if (!res.success) {
            setError(res.error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-10 relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/40">
                        <Chrome className="text-foreground" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Get Started</h1>
                    <p className="text-muted text-sm mt-2">Join AERO and boost your productivity</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 group mt-4">
                        Create Account
                        <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-foreground/5 text-center">
                    <p className="text-sm text-muted">
                        Already have an account?
                        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold ml-1 underline decoration-primary/20 underline-offset-4">
                            Log In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
