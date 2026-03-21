"use client";

import { useState, useEffect } from "react";
import { useAuth, API_URL } from "@/context/AuthContext";
import {
    Timer,
    Coffee,
    Play,
    Pause,
    RotateCcw,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function PomodoroPage() {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("work"); // work | break
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let interval;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === "work") {
                alert("Work session finished! Time for a break.");
                setMode("break");
                setTimeLeft(5 * 60);
            } else {
                alert("Break finished! Back to work.");
                setMode("work");
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    async function fetchHistory() {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_URL}/pomodoro`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching pomodoro history");
        }
    }

    const toggleTimer = () => {
        const newActive = !isActive;
        setIsActive(newActive);
        if (newActive) {
            syncWithExtension(timeLeft / 60);
        }
    };

    const syncWithExtension = (minutes) => {
        const extensionId = "dfbcfgkpgbfbdjabippomkelpkboffen";
        if (typeof window !== "undefined" && window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage(extensionId, {
                action: "startPomodoro",
                minutes: Math.ceil(minutes)
            }, (response) => {
                if (window.chrome.runtime.lastError) {
                    console.warn("❌ Could not sync Pomodoro:", window.chrome.runtime.lastError.message);
                } else {
                    console.log("✅ Pomodoro synced to extension");
                    // Refresh history after a short delay to see the new entry
                    setTimeout(fetchHistory, 2000);
                }
            });
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (!user) return null;

    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">Pomodoro Focus</h1>
                <p className="text-muted">Stay sharp using the 25/5 technique.</p>
            </div>

            <div className="relative">
                <div className={`absolute inset-0 bg-${mode === 'work' ? 'primary' : 'secondary'}/20 rounded-full blur-[80px] transition-all duration-700`} />
                <div className="relative w-80 h-80 glass-card rounded-full border-4 border-foreground/5 flex flex-col items-center justify-center shadow-2xl">
                    <div className="flex items-center gap-2 text-muted uppercase text-xs tracking-widest font-bold mb-2">
                        {mode === 'work' ? <Zap size={14} className="text-primary" /> : <Coffee size={14} className="text-secondary" />}
                        {mode === 'work' ? 'Deep Work' : 'Short Break'}
                    </div>
                    <div className="text-7xl font-black font-mono">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={toggleTimer}
                    className={`flex items-center gap-2 px-10 py-5 rounded-3xl font-bold transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-foreground/10 text-foreground' : 'bg-primary text-background'}`}
                >
                    {isActive ? <Pause size={24} /> : <Play size={24} />}
                    {isActive ? 'Pause' : 'Start Focus'}
                </button>
                <button
                    onClick={resetTimer}
                    className="p-5 bg-foreground/5 border border-foreground/10 rounded-3xl hover:bg-foreground/10 transition-all text-muted hover:text-foreground"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            <div className="flex gap-2 p-1 bg-foreground/5 rounded-2xl border border-foreground/10">
                <button
                    onClick={() => { setMode("work"); setTimeLeft(25 * 60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? 'bg-foreground/10 text-foreground shadow-lg' : 'text-muted hover:text-foreground'}`}
                >
                    Work
                </button>
                <button
                    onClick={() => { setMode("break"); setTimeLeft(5 * 60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-foreground/10 text-foreground shadow-lg' : 'text-muted hover:text-foreground'}`}
                >
                    Break
                </button>
            </div>

            {/* Session History */}
            <div className="w-full max-w-md mt-12 space-y-4 pb-20">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-foreground/5 pb-2">
                    <Timer size={20} className="text-muted" /> Recent Sessions
                </h2>
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-center text-muted italic text-sm py-8">No recent sessions found.</p>
                    ) : (
                        history.map((session) => (
                            <div key={session._id} className="glass-card p-4 flex justify-between items-center group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${session.type === 'work' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                        {session.type === 'work' ? <Zap size={16} /> : <Coffee size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-bold capitalize">{session.type} Block</p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-tighter">
                                            <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{session.durationMinutes}m Goal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${session.completed ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-foreground/5 text-muted'}`}>
                                    {session.completed ? 'Achieved' : 'Idle'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
