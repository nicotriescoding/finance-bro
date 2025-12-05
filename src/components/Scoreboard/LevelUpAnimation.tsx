"use client";
import { useEffect, useState } from "react";

type Props = {
    trigger: boolean;
    duration?: number; // ms
    onDone?: () => void;
};

type Emoji = {
    id: number;
    left: string;
    delay: number;
};

export default function LevelUpAnimation({ trigger, duration = 2000, onDone }: Props) {
    const [active, setActive] = useState(false);
    const [emojis, setEmojis] = useState<Emoji[]>([]);

    useEffect(() => {
        if (trigger) {
            setActive(true);

            // Erzeuge 8 zufällige Geldscheine
            const generated = Array.from({ length: 8 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 80 + 10}%`, // irgendwo zwischen 10% und 90%
                delay: Math.random() * 0.5, // Verzögerung bis Start
            }));
            setEmojis(generated);

            const t = setTimeout(() => {
                setActive(false);
                setEmojis([]);
                onDone?.();
            }, duration);

            return () => clearTimeout(t);
        }
    }, [trigger, duration, onDone]);

    if (!active) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {emojis.map((emoji) => (
                <span
                    key={emoji.id}
                    className="absolute text-3xl animate-money-fall"
                    style={{
                        left: emoji.left,
                        bottom: "0%",
                        animationDelay: `${emoji.delay}s`,
                    }}
                >
          💸
        </span>
            ))}
        </div>
    );
}