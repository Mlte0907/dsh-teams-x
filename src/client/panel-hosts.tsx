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

import type { ReactElement } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: declare the right Sidebar's tab registry, its two seats and the
// keyed `main` dispatch on hosts that ship them (0.1.5-rc.1+).
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './ActivityPanel.module.css'
import { TeamsXLogo } from './icons.tsx'
import { TeamsXPanelBody } from './ActivityPanel.tsx'
import { TEAMSX_LOCALE_NAMESPACE } from './locales.ts'
import type { PanelTranslate } from './ActivityPanel.tsx'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'

/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void

/**
 * Tab type id, its body/title seat key, and the tab's `kind`. One value, so
 * the registry, the seats and the open-tab dispatch all address this tab.
 */
const HOST_ID = 'teams-x'
/** Tab kind `openTab` names; namespaced because another plugin may own `teams`. */
const HOST_KIND = 'teams-x'
/** Guide capsule order: after the shipped entries (Files is 10). */
const GUIDE_ORDER = 30

/** Props the right Sidebar's tab seat delivers: the session and the locale `t`. */
type TabBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsLocale<'teamsX'>
  & { readonly openMember: OpenMember }

/** The right Sidebar tab: the shared body in the panel's own scrolling column. */
export function TeamsXTabBody({ sessionId, t, openMember }: TabBodyProps): ReactElement {
  return (
    <div className={css.panel}>
      <TeamsXPanelBody sessionId={sessionId} t={t} openMember={openMember} />
    </div>
  )
}

/**
 * The tab chip's title seat. It reads the plugin's own bound translate rather
 * than the tab-information hook: a foreign or not-yet-committed tab record can
 * throw there, and the chip still has to draw.
 * @param t - the plugin-namespace translate.
 * @returns the chip's title component.
 */
function makeTabTitle(t: PanelTranslate): () => ReactElement {
  return function TeamsXTabTitle(): ReactElement {
    return (
      <>
        <TeamsXLogo size={16} className={css.tabTitleIcon} decorative />
        <span className={css.tabTitleLabel}>{t('tab')}</span>
      </>
    )
  }
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
function registerSidebarTab(ctx: ClientContext, openMember: OpenMember, t: PanelTranslate): void {
  ctx.inject(['sidebarRightTabs'], (injected) => {
    const disposers: (() => void)[] = []
    const own = (result: unknown): void => {
      if (typeof result === 'function') disposers.push(result as () => void)
    }
    try {
      const tabs = injected.sidebarRightTabs
      if (tabs === undefined || typeof tabs.register !== 'function') return
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
      }))
      own(injected.slots.inject('sidebar.right.pane.tab', () => injected.slots.register({
        name: 'sidebar.right.pane.tab',
        key: HOST_ID,
        locale: TEAMSX_LOCALE_NAMESPACE,
        inject: () => ({ openMember }),
      }, TeamsXTabBody)))
      own(injected.slots.inject('sidebar.right.pane.tab.title', () => injected.slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: HOST_ID,
      }, makeTabTitle(t))))
    } catch (error: unknown) {
      for (const dispose of disposers) dispose()
      console.warn('teams-x: right Sidebar tab unavailable on this host', error)
      return
    }
    return () => {
      for (const dispose of disposers) dispose()
    }
  })
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
export function registerPanelHosts(ctx: ClientContext, openMember: OpenMember): void {
  const locale = ctx.locale as { bind?: (namespace: string) => PanelTranslate }
  if (typeof locale.bind !== 'function') {
    console.warn('teams-x: locale.bind unavailable; the right Sidebar tab is disabled')
    return
  }
  const t = locale.bind(TEAMSX_LOCALE_NAMESPACE)
  registerSidebarTab(ctx, openMember, t)
}
