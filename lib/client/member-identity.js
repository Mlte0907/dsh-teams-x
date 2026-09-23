/**
 * 成员印记（member identity）—— one resolver, two identity facts.
 *
 * A member keeps the same ink color and the same role glyph everywhere the
 * panel names them (roster cells, task assignees, inbox senders). Both facts
 * derive deterministically from the member's own strings, so they survive
 * reloads, reorders, and poll churn with zero stored state:
 *
 * - 印记墨水 `memberInk`: FNV-1a over the name, mapped onto the identity-ink
 *   slots (`--tx-mate-*`). Identity ink is the one sanctioned multi-hue
 *   exception to the panel's single-accent law: it appears only on the
 *   smallest identity surfaces (icon chip, assignee mark, sender dot),
 *   never on controls or backgrounds.
 * - 徽记 `memberSigil`: bilingual keyword buckets over `name + role`, ordered
 *   specific → broad (first match wins). Falls back to the plugin logo for
 *   roles the buckets cannot read, so an unknown role degrades gracefully
 *   instead of vanishing.
 * @module dsh-teams-x/client/member-identity
 */
/** Identity-ink slot count; CSS defines `--tx-mate-0` … `--tx-mate-5`. */
export const MEMBER_INK_SLOTS = 6;
/** FNV-1a (32-bit) over the member name — short, order-sensitive, stable. */
export function memberInkIndex(name) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < name.length; index++) {
        hash ^= name.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash % MEMBER_INK_SLOTS;
}
/** The CSS custom property holding this member's identity ink. */
export function memberInk(name) {
    return `var(--tx-mate-${memberInkIndex(name)})`;
}
/**
 * Keyword buckets, specific before broad. Matching runs over the member's
 * name and role together (lowercased), so either string can carry the signal
 * and both zh and en vocabularies resolve.
 */
const SIGIL_RULES = [
    [/队长|captain|\blead\b|统筹|拆解|派发|汇总|协调/, 'lead'],
    [/secur|审计|安全|风险|threat|audit/, 'security'],
    [/\bqa\b|测试|质量|验证|验收|\btest|verif|quality/, 'qa'],
    [/审阅|评审|校对|proofread|\breview/, 'reviewer'],
    [/调研|研究|论文|科研|科学|实验|research|scientif/, 'researcher'],
    [/文档|写作|文案|撰写|规范|\bdoc|writer|\bspec/, 'docs'],
    [/数据|分析|指标|资料|\bdata\b|analys|metric/, 'data'],
    [/设计|视觉|交互|前端|\bui\b|\bux\b|design|front/, 'designer'],
    [/运维|部署|发布|构建|\bops\b|deploy|release|\bci\b|\bbuild\b/, 'operator'],
    [/工程|开发|编程|代码|后端|实现|求解|engineer|\bdev\b|backend|\bapi\b|program|coding/, 'engineer'],
];
/**
 * The sigil key for a member, or undefined when nothing matches (the roster
 * renders the plugin logo instead — a real fallback, not a blank).
 */
export function memberSigil(name, role) {
    const identity = `${name} ${role}`.toLowerCase();
    for (const [pattern, sigil] of SIGIL_RULES) {
        if (pattern.test(identity))
            return sigil;
    }
    return undefined;
}
