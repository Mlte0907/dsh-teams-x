/**
 * Browser plugin for the TeamsX activity panel.
 *
 * Registers the locale dictionaries and mounts the activity badge into the
 * session header's action list (`conversation.session.header.actions`, next
 * to the autonomous-mode and Session-log controls). The slot is
 * session-scoped: the framework resolves the current `sessionId`, and the
 * badge renders only when this session owns or participates in a team.
 * @module dsh-teams-x/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only merges: locale (ctx.locale), renderer (ctx.slots), and the
// conversation SlotMap row that declares the session-header action seat.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
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
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'teams-x-activity',
    // After the jobs entry (20): process work reads before team activity.
    order: 30,
    label: 'TeamsX activity',
    locale: TEAMSX_LOCALE_NAMESPACE,
  }, ActivityPanel))
}
