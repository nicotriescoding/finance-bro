import { Suspense } from "react";
import type { Metadata } from "next";
import CareerSetup from "@/components/career/CareerSetup";

export const metadata: Metadata = {
    title: "Career",
    description:
        "Choose your dead-end career: pick a subject, tick the topics, and start a run of business-administration exam questions.",
};

// Render per request so the ?subject param is resolved server-side and the
// full setup page (not the Suspense fallback) is in the HTML - the route
// smoke test asserts on its copy.
export const dynamic = "force-dynamic";

export default function CareerPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-muted">Loading…</div>}>
            <CareerSetup />
        </Suspense>
    );
}
