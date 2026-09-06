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
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only merges: locale (ctx.locale), renderer (ctx.slots), sessions
// (ctx.sessions), and the conversation SlotMap row that declares the
// session-header action seat.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { ActivityPanel } from './ActivityPanel.tsx'
import { TEAMSX_LOCALE_NAMESPACE, en, zh } from './locales.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { TeamsXSessionNavigator } from './session-navigation.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** TeamsX activity panel copy. */
    teamsX: TeamsXLocaleKey
  }
}

/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation), uiConversation (card registration). */
export const inject = ['slots', 'locale', 'sessions', 'uiConversation']

export function apply(ctx: ClientContext): void {
  ctx.effect(
    () => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, { zh, en }),
    'teams-x: dictionaries',
  )
  const sessions = ctx.sessions as ISessions & TeamsXSessionNavigator
  const openMember = (parentId: string, childId: string): void => {
    void import('./session-navigation.ts').then(({ openTeamsXMember }) => openTeamsXMember(sessions, parentId as SessionId, childId as SessionId))
      .catch((error: unknown) => {
        console.warn(`teams-x: failed to open member transcript ${childId}: ${String(error)}`)
      })
  }
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'teams-x-activity',
    // After the jobs entry (20): process work reads before team activity.
    order: 30,
    label: 'TeamsX activity',
    locale: TEAMSX_LOCALE_NAMESPACE,
  }, (props) => <ActivityPanel {...props} sessions={sessions} openMember={openMember} />))
}
