/**
 * Browser plugin for the TeamsX activity panel.
 *
 * Registers the locale dictionaries and mounts the activity panel in the
 * shell's additive overlay slot. Leaner than the reference client: one panel,
 * one slot, one card — no conversation-node card in v0.1 (roadmap item).
 * @module dsh-teams-x/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only merges: locale (ctx.locale), renderer (ctx.slots), and the
// layout frame's SlotMap row that declares the 'shell.overlay' seat.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { ActivityPanel } from './ActivityPanel.tsx'
import { TEAMSX_LOCALE_NAMESPACE, en, zh } from './locales.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** TeamsX activity panel copy. */
    teamsX: TeamsXLocaleKey
  }
}

/** Required services: slots (mount point) and locale (dictionaries). */
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.effect(
    () => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, { zh, en }),
    'teams-x: dictionaries',
  )
  const Panel = ({ t }: PropsLocale<'teamsX'>) => (
    <ActivityPanel t={t} />
  )
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'teams-x-activity',
    order: 81,
    label: 'TeamsX activity',
    locale: TEAMSX_LOCALE_NAMESPACE,
  }, Panel))
}
