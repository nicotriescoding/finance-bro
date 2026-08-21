// client-side hook, simple localStorage binding
"use client";
import { useEffect, useState } from "react";

/**
 * Same-key instances of this hook stay in sync: the navbar balance pill and
 * the quiz both bind "bwr_score_v1", and a credit in the quiz must show up in
 * the chrome immediately (design 3a: the pill is the only animated chrome).
 * Cross-component sync uses a CustomEvent; cross-tab sync uses the native
 * storage event.
 */
const SYNC_EVENT = "fb:persistent-state";

type SyncDetail = { key: string; raw: string };

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
            const raw = JSON.stringify(state);
            if (localStorage.getItem(key) !== raw) {
                localStorage.setItem(key, raw);
                window.dispatchEvent(
                    new CustomEvent<SyncDetail>(SYNC_EVENT, { detail: { key, raw } })
                );
            }
        } catch {
            // ignore write errors (private mode etc.)
        }
    }, [key, state]);

    useEffect(() => {
        const apply = (raw: string | null) => {
            if (raw === null) return;
            try {
                setState((prev) => {
                    // skip no-op updates so the sync cannot loop
                    return JSON.stringify(prev) === raw ? prev : (JSON.parse(raw) as T);
                });
            } catch {
                /* ignore malformed values */
            }
        };
        const onCustom = (e: Event) => {
            const detail = (e as CustomEvent<SyncDetail>).detail;
            if (detail?.key === key) apply(detail.raw);
        };
        const onStorage = (e: StorageEvent) => {
            if (e.key === key) apply(e.newValue);
        };
        window.addEventListener(SYNC_EVENT, onCustom);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener(SYNC_EVENT, onCustom);
            window.removeEventListener("storage", onStorage);
        };
    }, [key]);

    return [state, setState] as const;
}
