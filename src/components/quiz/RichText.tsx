import { Fragment } from "react";
import katex from "katex";

/**
 * Renders question text with two kinds of inline markup:
 *
 *   `$...$`   - a KaTeX math segment, written in LaTeX exactly as the lecture
 *               would put it on a slide (`$FV = C \cdot \frac{q^N - 1}{q - 1}$`).
 *   `**...**` - bold.
 *
 * Everything else is plain text. This is deliberately not a markdown parser:
 * two delimiters cover the whole bank, and anything richer would invite
 * formatting bugs inside generated question strings.
 *
 * Authoring rules live in `.claude/rules/questions.md`; `npm run verify`
 * compiles every math segment and fails the build on invalid LaTeX or an
 * unbalanced `$`.
 */
export default function RichText({ text }: { text: string }) {
    return (
        <>
            {text.split(/(\$[^$]+\$)/g).map((part, i) => {
                if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
                    return <MathSegment key={i} tex={part.slice(1, -1)} />;
                }
                return <Fragment key={i}>{renderBold(part)}</Fragment>;
            })}
        </>
    );
}

function MathSegment({ tex }: { tex: string }) {
    // throwOnError: false renders the raw TeX in red instead of crashing the
    // question card; the build gate catches invalid TeX before it ships.
    const html = katex.renderToString(tex, { throwOnError: false, strict: false });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderBold(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i} className="font-semibold text-slate-900">
                {part.slice(2, -2)}
            </strong>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}
