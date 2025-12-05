// client-side hook, simple localStorage binding
"use client";
import { useState, useEffect } from "react";

export function usePersistentState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        try {
            if (typeof window === "undefined") return defaultValue;
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // ignore write errors (private mode etc.)
        }
    }, [key, state]);

    return [state, setState] as const;
}

