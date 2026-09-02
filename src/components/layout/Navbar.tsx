"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BalancePill from "@/components/account/BalancePill";

const LINKS = [
    { href: "/quiz", label: "Quiz 🧠", match: "/quiz" },
    { href: "/products", label: "Bro Shop 💸", match: "/products" },
    { href: "/multiplayer", label: "Multiplayer 🥋", match: "/multiplayer" },
    { href: "/leaderboard", label: "Leaderboard 🏆", match: "/leaderboard" },
    { href: "/library", label: "Library 📚", match: "/library" },
    { href: "/career", label: "Career 🪦", match: "/career" },
];

/**
 * The navy chrome (design 3a): brand left, everything else bound to the
 * right by a flex spacer. On phones the links move to the bottom tab bar.
 */
export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full bg-ink">
            <div className="flex h-14 items-center gap-3 px-4 md:h-16 md:px-[22px]">
                <Link href="/" className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold tracking-[-0.02em] text-white md:text-xl">
                        FinanceBro
                    </span>
                    <span className="animate-fly inline-block text-[17px] md:text-[19px]">💸</span>
                </Link>
                <span className="caps-label hidden pl-0.5 text-[10px] tracking-[.16em] text-muted-light 2xl:inline">
                    Private client · est. 2026
                </span>
                <div className="flex-1" />
                <div className="hidden items-center gap-1 md:flex">
                    {LINKS.map((link) => {
                        const active = pathname.startsWith(link.match);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`whitespace-nowrap rounded-[9px] px-3 py-2 text-[15px] transition ${
                                    active
                                        ? "bg-brand font-extrabold text-white"
                                        : "font-semibold text-link-navy hover:text-[#e8eef5]"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
                <span className="mx-1.5 hidden h-[26px] w-px bg-ink-line md:block" />
                <BalancePill />
            </div>
        </nav>
    );
}
