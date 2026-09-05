import { jsx as _jsx } from "react/jsx-runtime";
import { ActivityPanel } from "./ActivityPanel.js";
import { TEAMSX_LOCALE_NAMESPACE, en, zh } from "./locales.js";
/** Required services: slots (mount point) and locale (dictionaries). */
export const inject = ['slots', 'locale'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, { zh, en }), 'teams-x: dictionaries');
    const Panel = ({ t }) => (_jsx(ActivityPanel, { t: t }));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'teams-x-activity',
        order: 81,
        label: 'TeamsX activity',
        locale: TEAMSX_LOCALE_NAMESPACE,
    }, Panel));
}
