/**
 * RichText — 把模型产出的汇报/通知文本排成可读版式（收件箱消息体）。
 *
 * A deliberately small grammar, tuned to what agent reports actually contain:
 * fenced code blocks, flat lists, paragraphs with soft breaks, and four inline
 * marks (code / bold / italic / strike). Everything else passes through as
 * plain text.
 *
 * The renderer builds React elements only — it never assembles an HTML
 * string, so every text leaf is an escaped React child and model-supplied
 * content is inert by construction. No sanitizer, no allowlist to maintain.
 * @module dsh-teams-x/client/rich-text
 */
import type { ReactElement } from 'react';
export interface RichTextProps {
    /** Model-produced plain text; nullish/empty renders nothing. */
    readonly text: string | undefined;
    /** Extra class for surface styling and clamping. */
    readonly className?: string;
}
/** Render agent text as React elements. Empty input renders nothing. */
export declare function RichText({ text, className }: RichTextProps): ReactElement | null;
