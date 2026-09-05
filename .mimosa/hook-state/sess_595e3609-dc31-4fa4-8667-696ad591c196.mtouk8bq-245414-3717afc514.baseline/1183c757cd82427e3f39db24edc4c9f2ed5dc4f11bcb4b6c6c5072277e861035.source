import { jsx as _jsx } from "react/jsx-runtime";
import { ActivityPanel } from "./ActivityPanel.js";
import { TEAMSX_LOCALE_NAMESPACE, en, zh } from "./locales.js";
/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation). */
export const inject = ['slots', 'locale', 'sessions'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, { zh, en }), 'teams-x: dictionaries');
    const sessions = ctx.sessions;
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
}
