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
 * (2026-10-11) The tab is also the column's answer to a team STARTING: the
 * header badge opens it through the opener this module returns, so the right
 * Sidebar pops onto TeamsX the moment a team exists for the session — before
 * the members spawn, which is what keeps dsh-better-sidebar's own subagent
 * trigger from having the column show its 任务管理 page instead.
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

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: declare the right Sidebar's tab registry and its two seats on
// hosts that ship them (0.1.5-rc.1+).
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './ActivityPanel.module.css'
import { TeamsXLogo } from './icons.tsx'
import { TeamsXPanelBody } from './ActivityPanel.tsx'
import { TEAMSX_LOCALE_NAMESPACE } from './locales.ts'
import { TEAMSX_VERSION } from './version.ts'
import { makeT } from './format.ts'
import type { PanelTranslate } from './ActivityPanel.tsx'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import { isSheetOpen, onSheetOpen } from './sheet-visibility.ts'

/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void

/**
 * Reveal the TeamsX tab in the right Sidebar. The plugin shell hands this to
 * the header badge, which calls it once when a team starts for its session; a
 * no-op while no seat serves the column (an older host, or a refused
 * registration).
 */
export type OpenSidebarTab = () => void

/**
 * The right column's face, reached structurally: the open needs three of the
 * controller's methods, and a host older than the seat has none of them.
 * (`openTab` is `ctx.sidebarRight`; the expanded-state pair is how a narrow
 * viewport is left unparked — see {@link registerSidebarTab}.)
 */
interface SidebarColumnFace {
  openTab?: (kind: string) => void
  isExpanded?: () => boolean
  toggleExpanded?: () => void
}

/**
 * On a phone the badge's bottom sheet can stack right on top of this pane —
 * the same team card twice on a 390px screen reads as broken. While the sheet
 * is open on a narrow viewport, this pane steps aside.
 */
function useSheetOccluded(): boolean {
  const [occluded, setOccluded] = useState(() => isSheetOpen() && window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = (): void => { setOccluded(isSheetOpen() && mq.matches) }
    sync()
    const unsubscribe = onSheetOpen(sync)
    mq.addEventListener('change', sync)
    return () => {
      unsubscribe()
      mq.removeEventListener('change', sync)
    }
  }, [])
  return occluded
}

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

function TabBody({ sessionId, t, openMember }: TabBodyProps): ReactElement {
  return (
    <div className={`${css.panel} ${css.panelTab}`}>
      <TeamsXPanelBody sessionId={sessionId} t={t} openMember={openMember} />
    </div>
  )
}

/** The right Sidebar tab: the shared body in the panel's own scrolling column. */
export function TeamsXTabBody(props: TabBodyProps): ReactElement {
  const occluded = useSheetOccluded()
  if (occluded) return <></>
  return <TabBody {...props} />
}

/**
 * The tab chip's title seat. It reads the plugin's own bound translate rather
 * than the tab-information hook: a foreign or not-yet-committed tab record can
 * throw there, and the chip still has to draw.
 * @param t - the plugin-namespace translate.
 * @returns the chip's title component.
 */
function makeTabTitle(t: PanelTranslate): () => ReactElement {
  const translate = makeT(t)
  return function TeamsXTabTitle(): ReactElement {
    return (
      <>
        <TeamsXLogo size={16} className={css.tabTitleIcon} decorative />
        <span className={css.tabTitleLabel}>{translate('tab', { version: TEAMSX_VERSION })}</span>
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
 * @returns the opener the header badge calls once a team starts.
 */
function registerSidebarTab(ctx: ClientContext, openMember: OpenMember, t: PanelTranslate): OpenSidebarTab {
  const translate = makeT(t)
  const reveal = (): void => {
    // Resolved per call rather than captured: the column's face binds (and
    // rebinds, on a plugin reload) independently of this registration, and a
    // host without that seat simply has no column to open.
    const column = (ctx as unknown as { get?: (name: string) => unknown })
      .get?.('sidebarRight') as SidebarColumnFace | undefined
    if (column === undefined || typeof column.openTab !== 'function') return
    try {
      // Starting a team is a deliberate act, so this open is ALLOWED to take
      // the column over — that is the point of it: landing the TeamsX tab by
      // the time the members spawn is what keeps dsh-better-sidebar's subagent
      // trigger from having the column show its 任务管理 page instead.
      // The one exception is a viewport narrow enough for the host to draw the
      // column fullscreen (how a phone gets it): the tab is placed, but a
      // column the user had collapsed is put back — parked behind the expand
      // control rather than covering the chat.
      const park = window.innerWidth < 768 && column.isExpanded?.() === false
      column.openTab(HOST_KIND)
      if (park) column.toggleExpanded?.()
    } catch (error: unknown) {
      // NOT gated on this incarnation's own registration: a hot-replaced
      // plugin can leave the tab type registered by its previous incarnation
      // (the registry refuses the second registration of an id), and the tab
      // the user must see is the one that exists. An unregistered kind lands
      // here as the registry's own "no tab type is registered" — informative
      // and once per team start, not per poll.
      console.warn('teams-x: could not open the TeamsX tab in the right Sidebar', error)
    }
  }
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
        title: () => translate('tab', { version: TEAMSX_VERSION }),
        guide: [{
          id: HOST_ID,
          order: GUIDE_ORDER,
          title: () => translate('tab', { version: TEAMSX_VERSION }),
          description: () => translate('sidebar.guideDescription'),
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
  return reveal
}

/**
 * Contribute every 0.1.5-only host. Called from `apply` before the badge is
 * mounted, so a host that serves none of these seats still has the panel.
 *
 * The labels of a seat registered outside React are read through the plugin's
 * own bound translate, so a locale service without `bind` (an older or minimal
 * host) costs the extra hosts and nothing else.
 * @param ctx - client root context.
 * @param openMember - member-transcript navigation.
 * @returns the opener the header badge calls when a team starts; a no-op on a
 * host without the right column.
 */
export function registerPanelHosts(ctx: ClientContext, openMember: OpenMember): OpenSidebarTab {
  const locale = ctx.locale as { bind?: (namespace: string) => PanelTranslate }
  if (typeof locale.bind !== 'function') {
    console.warn('teams-x: locale.bind unavailable; the right Sidebar tab is disabled')
    return () => {}
  }
  const t = locale.bind(TEAMSX_LOCALE_NAMESPACE)
  return registerSidebarTab(ctx, openMember, t)
}
