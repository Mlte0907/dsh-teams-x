import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The 0.1.5-only hosts for the shared TeamsX activity body.
 *
 * The right Sidebar tab is the extra way into the same content the
 * session-header badge opens as a dropdown — and on a phone the right Sidebar
 * is the full-width drawer, so this is the mobile-reachable one.
 *
 * (2026-09-12) The sidebar panel-icon row entry and its main-column panel are
 * GONE by product decision: the desktop left sidebar must not offer a TeamsX
 * button (its panel duplicated the badge dropdown and the right-Sidebar tab).
 * Only the right-Sidebar tab registration remains here.
 *
 * OPTIONAL BY CONTRACT. `ctx.sidebarRightTabs` and the keyed `main` dispatch
 * ship on the 0.1.5-rc.1 line only, so every registration here rides a
 * DEFERRED inject and is guarded: the plugin's hard injects stay `slots` +
 * `locale`, and on a host without these seats nothing is registered, the
 * callback never fires, and the shipped badge keeps working.
 * A foreign registry (a throwing `register`, a taken id) costs the extra host,
 * never the browser.
 * @module dsh-teams-x/client/panel-hosts
 */
import { useEffect, useState } from 'react';
import css from './ActivityPanel.module.css';
import { TeamsXLogo } from "./icons.js";
import { TeamsXPanelBody } from "./ActivityPanel.js";
import { TEAMSX_LOCALE_NAMESPACE } from "./locales.js";
import { isSheetOpen, onSheetOpen } from "./sheet-visibility.js";
/**
 * On a phone the badge's bottom sheet can stack right on top of this pane —
 * the same team card twice on a 390px screen reads as broken. While the sheet
 * is open on a narrow viewport, this pane steps aside.
 */
function useSheetOccluded() {
    const [occluded, setOccluded] = useState(() => isSheetOpen() && window.matchMedia('(max-width: 768px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const sync = () => { setOccluded(isSheetOpen() && mq.matches); };
        sync();
        const unsubscribe = onSheetOpen(sync);
        mq.addEventListener('change', sync);
        return () => {
            unsubscribe();
            mq.removeEventListener('change', sync);
        };
    }, []);
    return occluded;
}
/**
 * Tab type id, its body/title seat key, and the tab's `kind`. One value, so
 * the registry, the seats and the open-tab dispatch all address this tab.
 */
const HOST_ID = 'teams-x';
/** Tab kind `openTab` names; namespaced because another plugin may own `teams`. */
const HOST_KIND = 'teams-x';
/** Guide capsule order: after the shipped entries (Files is 10). */
const GUIDE_ORDER = 30;
function TabBody({ sessionId, t, openMember }) {
    return (_jsx("div", { className: `${css.panel} ${css.panelTab}`, children: _jsx(TeamsXPanelBody, { sessionId: sessionId, t: t, openMember: openMember }) }));
}
/** The right Sidebar tab: the shared body in the panel's own scrolling column. */
export function TeamsXTabBody(props) {
    const occluded = useSheetOccluded();
    if (occluded)
        return _jsx(_Fragment, {});
    return _jsx(TabBody, { ...props });
}
/**
 * The tab chip's title seat. It reads the plugin's own bound translate rather
 * than the tab-information hook: a foreign or not-yet-committed tab record can
 * throw there, and the chip still has to draw.
 * @param t - the plugin-namespace translate.
 * @returns the chip's title component.
 */
function makeTabTitle(t) {
    return function TeamsXTabTitle() {
        return (_jsxs(_Fragment, { children: [_jsx(TeamsXLogo, { size: 16, className: css.tabTitleIcon, decorative: true }), _jsx("span", { className: css.tabTitleLabel, children: t('tab') })] }));
    };
}
/**
 * Register the right Sidebar tab type, its body and its chip title when the
 * host serves the sidebar tab registry. Contributes the guide capsule too, so
 * the sidebar's own guide page offers TeamsX — the product's path, the same one
 * the shipped Files type takes.
 * @param ctx - client root context carrying `slots`.
 * @param openMember - member-transcript navigation.
 * @param t - the plugin-namespace translate for labels and copy.
 */
function registerSidebarTab(ctx, openMember, t) {
    ctx.inject(['sidebarRightTabs'], (injected) => {
        const disposers = [];
        const own = (result) => {
            if (typeof result === 'function')
                disposers.push(result);
        };
        try {
            const tabs = injected.sidebarRightTabs;
            if (tabs === undefined || typeof tabs.register !== 'function')
                return;
            own(tabs.register({
                id: HOST_ID,
                kind: HOST_KIND,
                title: () => t('tab'),
                guide: [{
                        order: GUIDE_ORDER,
                        title: () => t('tab'),
                        description: () => t('sidebar.guideDescription'),
                        icon: TeamsXLogo,
                    }],
            }));
            own(injected.slots.inject('sidebar.right.pane.tab', () => injected.slots.register({
                name: 'sidebar.right.pane.tab',
                key: HOST_ID,
                locale: TEAMSX_LOCALE_NAMESPACE,
                inject: () => ({ openMember }),
            }, TeamsXTabBody)));
            own(injected.slots.inject('sidebar.right.pane.tab.title', () => injected.slots.register({
                name: 'sidebar.right.pane.tab.title',
                key: HOST_ID,
            }, makeTabTitle(t))));
        }
        catch (error) {
            for (const dispose of disposers)
                dispose();
            console.warn('teams-x: right Sidebar tab unavailable on this host', error);
            return;
        }
        return () => {
            for (const dispose of disposers)
                dispose();
        };
    });
}
/**
 * Contribute every 0.1.5-only host. Called from `apply` after the badge is
 * mounted, so a host that serves none of these seats still has the panel.
 *
 * The labels of a seat registered outside React are read through the plugin's
 * own bound translate, so a locale service without `bind` (an older or minimal
 * host) costs the extra hosts and nothing else.
 * @param ctx - client root context.
 * @param openMember - member-transcript navigation.
 */
export function registerPanelHosts(ctx, openMember) {
    const locale = ctx.locale;
    if (typeof locale.bind !== 'function') {
        console.warn('teams-x: locale.bind unavailable; the right Sidebar tab is disabled');
        return;
    }
    const t = locale.bind(TEAMSX_LOCALE_NAMESPACE);
    registerSidebarTab(ctx, openMember, t);
}
