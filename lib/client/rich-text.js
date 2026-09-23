import { jsx as _jsx } from "react/jsx-runtime";
/** Inline marks, tried left to right; code spans win so their markers survive. */
const INLINE_PATTERN = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(~~[^~\n]+~~)/g;
function renderInline(text, keyPrefix) {
    const nodes = [];
    let cursor = 0;
    let index = 0;
    for (const match of text.matchAll(INLINE_PATTERN)) {
        if (match.index === undefined)
            continue;
        if (match.index > cursor)
            nodes.push(text.slice(cursor, match.index));
        const [raw] = match;
        const key = `${keyPrefix}i${index++}`;
        if (raw.startsWith('`'))
            nodes.push(_jsx("code", { children: raw.slice(1, -1) }, key));
        else if (raw.startsWith('**'))
            nodes.push(_jsx("strong", { children: raw.slice(2, -2) }, key));
        else if (raw.startsWith('~~'))
            nodes.push(_jsx("del", { children: raw.slice(2, -2) }, key));
        else
            nodes.push(_jsx("em", { children: raw.slice(1, -1) }, key));
        cursor = match.index + raw.length;
    }
    if (cursor < text.length)
        nodes.push(text.slice(cursor));
    return nodes;
}
const LIST_ITEM_PATTERN = /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/;
const FENCE_PATTERN = /^\s*```/;
function renderBlocks(text) {
    const lines = String(text ?? '').split('\n');
    const blocks = [];
    let index = 0;
    let key = 0;
    while (index < lines.length) {
        const line = lines[index] ?? '';
        if (line.trim() === '') {
            index++;
            continue;
        }
        if (FENCE_PATTERN.test(line)) {
            const code = [];
            index++;
            while (index < lines.length && !FENCE_PATTERN.test(lines[index] ?? '')) {
                code.push(lines[index] ?? '');
                index++;
            }
            index++; // closing fence (or past end for an unterminated block)
            blocks.push(_jsx("pre", { children: _jsx("code", { children: code.join('\n') }) }, `b${key++}`));
            continue;
        }
        const item = LIST_ITEM_PATTERN.exec(line);
        if (item !== null) {
            const ordered = /^\s*\d/.test(line);
            const items = [];
            while (index < lines.length) {
                const next = LIST_ITEM_PATTERN.exec(lines[index] ?? '');
                if (next === null)
                    break;
                items.push(_jsx("li", { children: renderInline(next[1] ?? '', `l${key}`) }, `l${key++}`));
                index++;
            }
            blocks.push(ordered ? _jsx("ol", { children: items }, `b${key++}`) : _jsx("ul", { children: items }, `b${key++}`));
            continue;
        }
        const paragraph = [];
        while (index < lines.length) {
            const current = lines[index] ?? '';
            if (current.trim() === '' || FENCE_PATTERN.test(current) || LIST_ITEM_PATTERN.test(current))
                break;
            if (paragraph.length > 0)
                paragraph.push(_jsx("br", {}, `br${key++}`));
            paragraph.push(...renderInline(current, `p${key}-`));
            index++;
        }
        blocks.push(_jsx("p", { children: paragraph }, `b${key++}`));
    }
    return blocks;
}
/** Render agent text as React elements. Empty input renders nothing. */
export function RichText({ text, className }) {
    if (text === undefined || text.trim() === '')
        return null;
    return _jsx("div", { className: className, children: renderBlocks(text) });
}
