"use client";

import { useState, useEffect } from "react";
import { useAuth, API_URL } from "@/context/AuthContext";
import axios from "axios";
import {
    Target,
    CheckCircle2,
    Circle,
    Plus,
    Trophy,
    Flame,
    X,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newGoal, setNewGoal] = useState({
        label: "",
        targetSeconds: 3600, // 1 hour default
        type: "productive",
        website: ""
    });

    useEffect(() => {
        if (user) {
            fetchGoals();
        }
    }, [user]);

    async function fetchGoals() {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_URL}/goals/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(res.data);
        } catch (err) {
            console.error("Error fetching goals");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateGoal(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.post(`${API_URL}/goals`, newGoal, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals([...goals, res.data]);
            setShowNewGoal(false);
            setNewGoal({ label: "", targetSeconds: 3600, type: "productive", website: "" });
        } catch (err) {
            console.error("Error creating goal");
        }
    }

    async function handleDeleteGoal(id) {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`${API_URL}/goals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(goals.filter(g => g._id !== id));
        } catch (err) {
            console.error("Error deleting goal");
        }
    }

    if (!user) return null;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold">Goal Center</h1>
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-500/20 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Live Tracking
                        </div>
                    </div>
                    <p className="text-muted mt-2">Set and achieve your daily productivity targets.</p>
                </div>
                <button
                    onClick={() => setShowNewGoal(true)}
                    className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                >
                    <Plus size={20} /> Create New Goal
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GoalStat icon={<Trophy className="text-accent" />} label="Active Goals" value={goals.length} />
                <GoalStat icon={<Flame className="text-orange-500" />} label="Avg Progress" value={goals.length > 0 ? `${Math.round(goals.reduce((a, b) => a + (b.progress || 0), 0) / goals.length)}%` : "0%"} />
                <GoalStat icon={<Target className="text-primary" />} label="Completed" value={goals.filter(g => g.progress === 100).length} />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-muted text-xs">Active Goals</h2>
                {loading ? (
                    <div className="py-20 text-center text-muted italic">Loading your target goals...</div>
                ) : goals.length === 0 ? (
                    <div className="glass-card p-20 text-center space-y-4">
                        <Target size={48} className="mx-auto text-muted/20" />
                        <p className="text-muted italic">No active goals found. Create one to start tracking your progress!</p>
                    </div>
                ) : (
                    goals.map(goal => (
                        <GoalItem
                            key={goal._id}
                            title={goal.label || (goal.website ? `Focus on ${goal.website}` : "Productivity Target")}
                            category={goal.type}
                            progress={goal.progress || 0}
                            currentSeconds={goal.currentSeconds || 0}
                            targetSeconds={goal.targetSeconds || 3600}
                            onDelete={() => handleDeleteGoal(goal._id)}
                        />
                    ))
                )}
            </div>

            {/* Modal for New Goal */}
            <AnimatePresence>
                {showNewGoal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card w-full max-w-md p-8 relative"
                        >
                            <button onClick={() => setShowNewGoal(false)} className="absolute top-6 right-6 text-muted hover:text-foreground">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold mb-6">Set New Goal</h2>
                            <form onSubmit={handleCreateGoal} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase">Goal Name</label>
                                    <input
                                        required
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm"
                                        placeholder="e.g. Deep Work Session"
                                        value={newGoal.label}
                                        onChange={e => setNewGoal({ ...newGoal, label: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase">Target Time</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm pr-10"
                                                placeholder="Hours"
                                                value={Math.floor(newGoal.targetSeconds / 3600)}
                                                onChange={e => {
                                                    const h = parseInt(e.target.value) || 0;
                                                    const m = Math.floor((newGoal.targetSeconds % 3600) / 60);
                                                    setNewGoal({ ...newGoal, targetSeconds: (h * 3600) + (m * 60) });
                                                }}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted font-bold">HRS</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm pr-10"
                                                placeholder="Minutes"
                                                value={Math.floor((newGoal.targetSeconds % 3600) / 60)}
                                                onChange={e => {
                                                    const m = parseInt(e.target.value) || 0;
                                                    const h = Math.floor(newGoal.targetSeconds / 3600);
                                                    setNewGoal({ ...newGoal, targetSeconds: (h * 3600) + (m * 60) });
                                                }}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted font-bold">MIN</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase">Goal Type</label>
                                        <select
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm"
                                            value={newGoal.type}
                                            onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                                        >
                                            <option value="productive">Productive</option>
                                            <option value="unproductive">Limit (Max)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase">Website (Optional)</label>
                                        <input
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm"
                                            placeholder="e.g. github.com"
                                            value={newGoal.website}
                                            onChange={e => setNewGoal({ ...newGoal, website: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button className="w-full bg-primary text-background font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 active:scale-95 text-sm">
                                    Create Goal Target
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GoalStat({ icon, label, value }) {
    return (
        <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 bg-foreground/5 rounded-xl">{icon}</div>
            <div>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold">{label}</p>
                <p className="text-2xl font-bold">{value === "--" ? value : value}</p>
            </div>
        </div>
    );
}

function GoalItem({ title, category, progress, currentSeconds, targetSeconds, onDelete }) {
    const formatDuration = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <motion.div
            whileHover={{ x: 5 }}
            className="glass-card p-5 flex flex-col md:flex-row items-center justify-between group gap-4"
        >
            <div className="flex items-center gap-5 flex-1 w-full">
                <div className="cursor-pointer">
                    {progress === 100 ? (
                        <CheckCircle2 className="text-primary" size={24} />
                    ) : (
                        <Circle className="text-muted group-hover:text-primary transition-colors" size={24} />
                    )}
                </div>
                <div>
                    <h3 className={`font-semibold ${progress === 100 ? 'line-through text-muted' : ''}`}>{title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-tighter ${category === 'productive' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                            {category}
                        </span>
                        <span className="text-[10px] text-muted font-bold">{formatDuration(currentSeconds)} / {formatDuration(targetSeconds)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-80">
                <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${category === 'unproductive' && progress > 90 ? 'bg-red-500' : 'bg-primary'}`}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono w-8 text-right">{progress}%</span>
                    <button onClick={onDelete} className="p-2 text-muted hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all md:opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
