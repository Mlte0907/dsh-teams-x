import { jsx as _jsx } from "react/jsx-runtime";
import { ActivityPanel } from "./ActivityPanel.js";
import { registerPanelHosts } from "./panel-hosts.js";
import { TeamsXHintHost } from "./hint-host.js";
import { teamsXCardDefinition } from "./card-definition.js";
import { TeamsXCardPanel } from "./TeamsXCardPanel.js";
import { requestTeamsXPanel } from "./open-request.js";
import { provideSessions } from "./client-runtime.js";
import { TEAMSX_LOCALE_NAMESPACE, en, zh } from "./locales.js";
/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation), uiConversation (card registration). */
export const inject = ['slots', 'locale', 'sessions', 'uiConversation'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, { zh, en }), 'teams-x: dictionaries');
    const sessions = ctx.sessions;
    // Hand the sessions face to the脉搏层 (live-activity) without threading it
    // through four component hops; see client-runtime.
    provideSessions(sessions);
    const openMember = (parentId, childId) => {
        void import("./session-navigation.js").then(({ openTeamsXMember }) => openTeamsXMember(sessions, parentId, childId))
            .catch((error) => {
            console.warn(`teams-x: failed to open member transcript ${childId}: ${String(error)}`);
        });
    };
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'teams-x-activity',
        // After the jobs entry (20): process work reads before team activity.
        order: 30,
        label: 'TeamsX activity',
        locale: TEAMSX_LOCALE_NAMESPACE,
    }, (props) => _jsx(ActivityPanel, { ...props, sessions: sessions, openMember: openMember })));
    registerConversationCard(ctx, openMember);
    registerTeamsXCommand(ctx);
    registerPanelHintHost(ctx);
    // 0.1.5-only hosts (right Sidebar tab + main-column panel). Deferred and
    // guarded inside, so an older host simply keeps the badge-only entry.
    registerPanelHosts(ctx, openMember);
}
/**
 * Fold `teamsx/*` events into in-chat cards. Feature-detected: a host
 * without the conversation registries (or a contract drift) only loses the
 * card — the header badge and panel keep working.
 */
function registerConversationCard(ctx, openMember) {
    try {
        const events = ctx.uiConversation?.events;
        if (typeof events?.register !== 'function') {
            console.warn('teams-x: conversation events registry unavailable; in-chat team cards disabled');
            return;
        }
        events.register(teamsXCardDefinition);
    }
    catch (error) {
        console.warn('teams-x: failed to register team cards; keeping the header panel only', error);
        return;
    }
    try {
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
            name: 'conversation.chat.node',
            key: 'teamsx-card',
            locale: TEAMSX_LOCALE_NAMESPACE,
            inject: () => ({ openMember }),
        }, TeamsXCardPanel));
    }
    catch (error) {
        console.warn('teams-x: failed to register the team card renderer', error);
    }
}
/**
 * Contribute the `/teamsx` slash command (popupSelect) that expands the
 * session's TeamsX panel. The commandUi service is requested through a
 * nested inject so a host without it cannot break the main apply path.
 */
function registerTeamsXCommand(ctx) {
    try {
        ctx.inject(['commandUi'], (scope) => {
            try {
                const command = scope.get('commandUi');
                ctx.effect(() => command.register({
                    name: 'teamsx',
                    // dsh >= 0.1.5 commandUi contract: description is a lazy
                    // localized-text resolver, not a static string.
                    description: () => 'Open the TeamsX team panel',
                    available: (session) => {
                        const sessions = ctx.sessions;
                        // Teammate sub-sessions have no captain panel of their own.
                        if (typeof sessions.subagentAddress !== 'function')
                            return true;
                        return sessions.subagentAddress(session.sessionId) === undefined;
                    },
                    ui: {
                        kind: 'popupSelect',
                        options: async () => [{ id: 'open', label: 'TeamsX' }],
                        onSelect: async (_option, session) => {
                            requestTeamsXPanel(session.sessionId);
                        },
                    },
                }), 'teams-x: /teamsx command');
            }
            catch (error) {
                console.warn('teams-x: commandUi unavailable; the /teamsx command is disabled', error);
            }
        });
    }
    catch (error) {
        console.warn('teams-x: commandUi service missing; the /teamsx command is disabled', error);
    }
}
/**
 * Mount the global hint host into the sidebar footer slot. Shown when
 * `/teamsx` is invoked but no panel is mounted (e.g. home screen). Feature-
 * detected: a host without the sidebar slot silently skips the hint.
 */
function registerPanelHintHost(ctx) {
    try {
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
            name: 'sidebar.footer.action',
            id: 'teams-x-hint-host',
            locale: TEAMSX_LOCALE_NAMESPACE,
        }, (props) => _jsx(TeamsXHintHost, { ...props })));
    }
    catch (error) {
        console.warn('teams-x: sidebar.footer.action slot unavailable; the /teamsx empty-state hint is disabled', error);
    }
}
