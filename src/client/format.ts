/**
 * Shared formatting and translate helpers for the TeamsX client surfaces.
 * @module dsh-teams-x/client/format
 */
import type { TeamsXLocaleKey } from './locale-keys.ts'

/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string

/** Interpolate `{key}` params into a locale string. */
export function format(template: string, params: Record<string, string | number> | undefined): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/gu, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  ))
}

/** Wrap the harness translate function with interpolation. */
export function makeT(t: PanelTranslate): (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string {
  return (key, params) => format(t(key, params), params)
}

/** The interpolated translate shape shared by every panel subcomponent. */
export type Translate = ReturnType<typeof makeT>

/** Compact token formatter: 1234 → 1.2k, 45600 → 45.6k. */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

/** Humanize a millisecond duration for the task-age badge. */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h${rest}m`
  return `${Math.floor(hours / 24)}d${hours % 24}h`
}
