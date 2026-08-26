/**
 * Browser-side multiplayer plumbing: player identity (localStorage) and the
 * worker endpoints. The worker URL comes from NEXT_PUBLIC_MP_URL; when it is
 * missing the /multiplayer page falls back to its canon placeholder state -
 * the rest of the site never touches this file (hard rule 1).
 */

const ID_KEY = "fb_mp_id";
const NAME_KEY = "fb_mp_name";

/** e.g. "https://finance-bro-mp.<account>.workers.dev" - no trailing slash */
export const MP_URL = (process.env.NEXT_PUBLIC_MP_URL ?? "").replace(/\/$/, "");

export const mpEnabled = MP_URL.length > 0;

export function getPlayerId(): string {
    try {
        const existing = localStorage.getItem(ID_KEY);
        if (existing && /^[a-f0-9]{8,32}$/.test(existing)) return existing;
        const bytes = new Uint8Array(8);
        crypto.getRandomValues(bytes);
        const id = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
        localStorage.setItem(ID_KEY, id);
        return id;
    } catch {
        // private mode: session-scoped identity is fine
        return Math.random().toString(16).slice(2, 18).padEnd(16, "0");
    }
}

export function getStoredName(): string {
    try {
        return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
        return "";
    }
}

export function storeName(name: string): void {
    try {
        localStorage.setItem(NAME_KEY, name);
    } catch {
        /* ignore */
    }
}

export async function createRoom(): Promise<string> {
    const res = await fetch(`${MP_URL}/api/rooms`, { method: "POST" });
    if (!res.ok) throw new Error("create_failed");
    const data = (await res.json()) as { code?: string };
    if (!data.code) throw new Error("create_failed");
    return data.code;
}

export function socketUrl(code: string, pid: string, name: string): string {
    const ws = MP_URL.replace(/^http/, "ws");
    const params = new URLSearchParams({ pid, name });
    return `${ws}/api/rooms/${encodeURIComponent(code)}/ws?${params.toString()}`;
}

export function inviteLink(code: string): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/multiplayer?room=${code}`;
}
