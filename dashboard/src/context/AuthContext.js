"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const API_URL = "http://localhost:5010/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data.user);
        } catch (err) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        } finally {
            setLoading(false);
        }
    }

    const syncTokenToExtension = (token) => {
        const extensionId = "dfbcfgkpgbfbdjabippomkelpkboffen"; // from .env / manifest
        console.log(`📡 Attempting to sync token to extension: ${extensionId}`);
        if (typeof window !== "undefined" && window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage(extensionId, { action: "setToken", token }, (response) => {
                if (window.chrome.runtime.lastError) {
                    console.warn("❌ Could not sync to extension:", window.chrome.runtime.lastError.message);
                    console.log("💡 Tip: Verify your Extension ID in chrome://extensions and update AuthContext.js if it differs.");
                } else {
                    console.log("✅ Successfully synced token to extension");
                }
            });
        } else {
            console.log("⚠️ window.chrome.runtime not available. Ensure you are on the dashboard and the extension is active.");
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            setUser(res.data.user);
            syncTokenToExtension(res.data.accessToken); // Sync to Extension
            router.push("/dashboard");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Login failed" };
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            setUser(res.data.user);
            syncTokenToExtension(res.data.accessToken); // Sync to Extension
            router.push("/dashboard");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
