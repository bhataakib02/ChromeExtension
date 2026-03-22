"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const API_URL = "http://localhost:5010/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Automatically mock a logged-in user to bypass the login system entirely
        setUser({
            name: "AERO User",
            email: "local@aero.com",
            isActive: true,
            avatar: ""
        });
        setLoading(false);
    }, []);

    // Provide dummy functions to prevent breaking any UI components that call them
    const login = async () => {
        router.push("/dashboard");
        return { success: true };
    };

    const register = async () => {
        router.push("/dashboard");
        return { success: true };
    };

    const logout = () => {
        router.push("/");
    };

    const checkUser = () => { };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
