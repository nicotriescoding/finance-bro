"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { href: "/quiz", emoji: "🧠", label: "Quiz", match: "/quiz" },
    { href: "/products", emoji: "💸", label: "Shop", match: "/products" },
    { href: "/multiplayer", emoji: "🥋", label: "Duel", match: "/multiplayer" },
    { href: "/leaderboard", emoji: "🏆", label: "Board", match: "/leaderboard" },
    { href: "/library", emoji: "📚", label: "Library", match: "/library" },
    { href: "/career", emoji: "🪦", label: "Career", match: "/career" },
];

/** Phone-only bottom tab bar (design 3a) - emoji over 10px labels on navy. */
export default function TabBar() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 flex h-[62px] items-center justify-around bg-ink px-1.5 md:hidden"
            style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
        >
            {TABS.map((tab) => {
                const active = pathname.startsWith(tab.match);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex flex-col items-center gap-0.5 ${
                            active ? "text-mint" : "text-muted-light"
                        }`}
                    >
                        <span className="text-[19px]">{tab.emoji}</span>
                        <span className={`text-[10px] ${active ? "font-extrabold" : "font-bold"}`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
