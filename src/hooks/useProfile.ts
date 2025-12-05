"use client";
import { useEffect } from "react";
import { usePersistentState } from "./usePersistentState";

export type Profile = {
    id: string;
    username: string;
    createdAt: string;
    lastSeen: string;
};

function genId() {
    try {
        // modern browsers
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
            // @ts-ignore
            return crypto.randomUUID();
        }
    } catch {}
    // fallback
    return "id_" + Math.random().toString(36).slice(2, 9);
}

function genDefaultUsername() {
    return "Bro" + Math.floor(Math.random() * 9000 + 1000);
}

export function useProfile() {
    const defaultProfile: Profile = {
        id: genId(),
        username: genDefaultUsername(),
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
    };

    const [profile, setProfile] = usePersistentState<Profile>("bwr_profile_v1", defaultProfile);

    // update lastSeen automatically when hook used (page open)
    useEffect(() => {
        setProfile((prev) => ({ ...prev, lastSeen: new Date().toISOString() }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    const updateUsername = (username: string) => {
        setProfile((p) => ({ ...p, username }));
    };

    const touch = () => {
        setProfile((p) => ({ ...p, lastSeen: new Date().toISOString() }));
    };

    return { profile, updateUsername, touch, setProfile };
}

