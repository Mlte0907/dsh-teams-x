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
export declare const MEMBER_INK_SLOTS = 6;
/** FNV-1a (32-bit) over the member name — short, order-sensitive, stable. */
export declare function memberInkIndex(name: string): number;
/** The CSS custom property holding this member's identity ink. */
export declare function memberInk(name: string): string;
/** Sigil keys mirror the role icon family exported by `icons.tsx`. */
export type MemberSigilKey = 'lead' | 'security' | 'qa' | 'reviewer' | 'researcher' | 'docs' | 'data' | 'designer' | 'operator' | 'engineer';
/**
 * The sigil key for a member, or undefined when nothing matches (the roster
 * renders the plugin logo instead — a real fallback, not a blank).
 */
export declare function memberSigil(name: string, role: string): MemberSigilKey | undefined;
