import type { LedgerEntry } from "@/lib/session";
import { formatMoney } from "@/lib/money";

type Props = {
    log: LedgerEntry[];
    /** how many recent postings to show */
    limit?: number;
};

/**
 * RECENT ACTIVITY - the session as a bank statement. Credits in green,
 * write-offs in burnt orange, and the standing punchline row at the bottom.
 */
export default function ActivityLedger({ log, limit = 4 }: Props) {
    const recent = [...log].reverse().slice(0, limit);

    return (
        <div className="overflow-hidden rounded-[14px] border border-hairline bg-surface">
            <div className="caps-label border-b border-hairline-soft px-3.5 py-2.5 text-[10px] text-muted">
                Recent activity
            </div>
            {recent.length === 0 && (
                <div className="border-b border-[#f4f7fa] px-3.5 py-2.5 text-[13px] text-ledger-mute">
                    No postings yet
                </div>
            )}
            {recent.map((e) => (
                <div
                    key={e.posting}
                    className="flex items-center justify-between gap-3 border-b border-[#f4f7fa] px-3.5 py-2.5 text-[13px]"
                >
                    <span className="truncate text-ledger">{e.label}</span>
                    {e.result === "credit" ? (
                        <span className="shrink-0 font-extrabold tabular-nums text-brand">
                            +{formatMoney(e.amount)}
                        </span>
                    ) : e.result === "skip" ? (
                        <span className="caps-label shrink-0 text-[9px] text-ledger-mute">
                            Skipped
                        </span>
                    ) : (
                        <span className="shrink-0 font-extrabold tabular-nums text-warn">−0</span>
                    )}
                </div>
            ))}
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[13px]">
                <span className="text-ledger-mute">Monthly account fee</span>
                <span className="shrink-0 font-extrabold text-ledger-mute">0 · we sell ads</span>
            </div>
        </div>
    );
}
