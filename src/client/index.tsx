/**
 * Browser plugin for the TeamsX activity panel and conversation cards.
 *
 * Registers the locale dictionaries, mounts the activity badge into the
 * session header's action list, folds `teamsx/*` session events into an
 * in-chat team card (ui-workflow-run pattern), and contributes the
 * `/teamsx` slash command that opens the panel. Every conversation/command
 * touchpoint is feature-detected and try-caught: on an older host the
 * header badge + panel keep working with zero regression.
 * @module dsh-teams-x/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only merges: locale (ctx.locale), renderer (ctx.slots), sessions
// (ctx.sessions), the conversation SlotMap row that declares the
// session-header action seat, the chat ChatNodeDataMap row for the card,
// and the commands contract type.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { CommandUiContract } from '@deepseek-ai/dsh-client-ui-commands/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { ActivityPanel } from './ActivityPanel.tsx'
import { TeamsXHintHost } from './hint-host.tsx'
import { teamsXCardDefinition } from './card-definition.tsx'
import { TeamsXCardPanel } from './TeamsXCardPanel.tsx'
import { requestTeamsXPanel } from './open-request.ts'
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
  registerConversationCard(ctx, openMember)
  registerTeamsXCommand(ctx)
  registerPanelHintHost(ctx)
}

/**
 * Fold `teamsx/*` events into in-chat cards. Feature-detected: a host
 * without the conversation registries (or a contract drift) only loses the
 * card — the header badge and panel keep working.
 */
function registerConversationCard(
  ctx: ClientContext,
  openMember: (parentId: string, childId: string) => void,
): void {
  try {
    const events = (ctx.uiConversation as {
      events?: { register?: (definition: unknown) => unknown }
    } | undefined)?.events
    if (typeof events?.register !== 'function') {
      console.warn('teams-x: conversation events registry unavailable; in-chat team cards disabled')
      return
    }
    events.register(teamsXCardDefinition)
  } catch (error: unknown) {
    console.warn('teams-x: failed to register team cards; keeping the header panel only', error)
    return
  }
  try {
    ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'teamsx-card',
      locale: TEAMSX_LOCALE_NAMESPACE,
      inject: () => ({ openMember }),
    }, TeamsXCardPanel))
  } catch (error: unknown) {
    console.warn('teams-x: failed to register the team card renderer', error)
  }
}

/**
 * Contribute the `/teamsx` slash command (popupSelect) that expands the
 * session's TeamsX panel. The commandUi service is requested through a
 * nested inject so a host without it cannot break the main apply path.
 */
function registerTeamsXCommand(ctx: ClientContext): void {
  try {
    ctx.inject(['commandUi'], (scope) => {
      try {
        const command = scope.get('commandUi') as CommandUiContract
        ctx.effect(
          () => command.register({
            name: 'teamsx',
            description: 'Open the TeamsX team panel',
            available: (session) => {
              const sessions = ctx.sessions as { subagentAddress?: (id: SessionId) => unknown }
              // Teammate sub-sessions have no captain panel of their own.
              if (typeof sessions.subagentAddress !== 'function') return true
              return sessions.subagentAddress(session.sessionId) === undefined
            },
            ui: {
              kind: 'popupSelect',
              options: async () => [{ id: 'open', label: 'TeamsX' }],
              onSelect: async (_option, session) => {
                requestTeamsXPanel(session.sessionId)
              },
            },
          }),
          'teams-x: /teamsx command',
        )
      } catch (error: unknown) {
        console.warn('teams-x: commandUi unavailable; the /teamsx command is disabled', error)
      }
    })
  } catch (error: unknown) {
    console.warn('teams-x: commandUi service missing; the /teamsx command is disabled', error)
  }
}

/**
 * Mount the global hint host into the sidebar footer slot. Shown when
 * `/teamsx` is invoked but no panel is mounted (e.g. home screen). Feature-
 * detected: a host without the sidebar slot silently skips the hint.
 */
function registerPanelHintHost(ctx: ClientContext): void {
  try {
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
      name: 'sidebar.footer.action',
      id: 'teams-x-hint-host',
      locale: TEAMSX_LOCALE_NAMESPACE,
    }, (props) => <TeamsXHintHost {...props} />))
  } catch (error: unknown) {
    console.warn('teams-x: sidebar.footer.action slot unavailable; the /teamsx empty-state hint is disabled', error)
  }
}
