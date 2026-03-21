"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <header className="h-20 border-b border-foreground/5 bg-foreground/10 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10 w-full">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search activity..."
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
            </div>

            <div className="flex items-center gap-5">
                <button className="p-2.5 rounded-xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all text-muted hover:text-foreground relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-black shadow-lg" />
                </button>

                <div className="h-10 w-[1px] bg-foreground/10 mx-1" />

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest">Pro Member</p>
                    </div>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-foreground/20" />
                    ) : (
                        <UserCircle size={36} className="text-muted" />
                    )}
                </div>
            </div>
        </header>
    );
}
