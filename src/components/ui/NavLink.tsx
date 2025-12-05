"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    children: ReactNode;
};

export default function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            }`}
        >
            {children}
        </Link>
    );
}
