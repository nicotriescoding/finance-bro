// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FinanzTrainer",
    description: "Übungsaufgaben & mehr",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
        <body className={inter.className}>
        {/* Navbar global */}
        <Navbar />
        <main>{children}</main>
        </body>
        </html>
    );
}