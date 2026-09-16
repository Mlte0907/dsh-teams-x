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
import type { ReactElement, ReactNode } from 'react'

/** Inline marks, tried left to right; code spans win so their markers survive. */
const INLINE_PATTERN = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(~~[^~\n]+~~)/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let index = 0
  for (const match of text.matchAll(INLINE_PATTERN)) {
    if (match.index === undefined) continue
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
    const [raw] = match
    const key = `${keyPrefix}i${index++}`
    if (raw.startsWith('`')) nodes.push(<code key={key}>{raw.slice(1, -1)}</code>)
    else if (raw.startsWith('**')) nodes.push(<strong key={key}>{raw.slice(2, -2)}</strong>)
    else if (raw.startsWith('~~')) nodes.push(<del key={key}>{raw.slice(2, -2)}</del>)
    else nodes.push(<em key={key}>{raw.slice(1, -1)}</em>)
    cursor = match.index + raw.length
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

const LIST_ITEM_PATTERN = /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/
const FENCE_PATTERN = /^\s*```/

function renderBlocks(text: string): ReactNode[] {
  const lines = String(text ?? '').split('\n')
  const blocks: ReactNode[] = []
  let index = 0
  let key = 0
  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (line.trim() === '') { index++; continue }
    if (FENCE_PATTERN.test(line)) {
      const code: string[] = []
      index++
      while (index < lines.length && !FENCE_PATTERN.test(lines[index] ?? '')) {
        code.push(lines[index] ?? '')
        index++
      }
      index++ // closing fence (or past end for an unterminated block)
      blocks.push(<pre key={`b${key++}`}><code>{code.join('\n')}</code></pre>)
      continue
    }
    const item = LIST_ITEM_PATTERN.exec(line)
    if (item !== null) {
      const ordered = /^\s*\d/.test(line)
      const items: ReactNode[] = []
      while (index < lines.length) {
        const next = LIST_ITEM_PATTERN.exec(lines[index] ?? '')
        if (next === null) break
        items.push(<li key={`l${key++}`}>{renderInline(next[1] ?? '', `l${key}`)}</li>)
        index++
      }
      blocks.push(ordered ? <ol key={`b${key++}`}>{items}</ol> : <ul key={`b${key++}`}>{items}</ul>)
      continue
    }
    const paragraph: ReactNode[] = []
    while (index < lines.length) {
      const current = lines[index] ?? ''
      if (current.trim() === '' || FENCE_PATTERN.test(current) || LIST_ITEM_PATTERN.test(current)) break
      if (paragraph.length > 0) paragraph.push(<br key={`br${key++}`} />)
      paragraph.push(...renderInline(current, `p${key}-`))
      index++
    }
    blocks.push(<p key={`b${key++}`}>{paragraph}</p>)
  }
  return blocks
}

export interface RichTextProps {
  /** Model-produced plain text; nullish/empty renders nothing. */
  readonly text: string | undefined
  /** Extra class for surface styling and clamping. */
  readonly className?: string
}

/** Render agent text as React elements. Empty input renders nothing. */
export function RichText({ text, className }: RichTextProps): ReactElement | null {
  if (text === undefined || text.trim() === '') return null
  return <div className={className}>{renderBlocks(text)}</div>
}
