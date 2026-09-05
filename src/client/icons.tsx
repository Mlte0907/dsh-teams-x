/**
 * Inline React SVG icon components for TeamsX — the only icon surface in the
 * client bundle (zero PNG). Bodies come from icon-data.ts so the standalone
 * assets/icons/*.svg exports and these components cannot drift.
 *
 * All icons inherit `currentColor`, so panel CSS themes them (active/idle/
 * muted) without per-icon styling; the animation classes used by action
 * states are defined in ActivityPanel.module.css.
 * @module dsh-teams-x/client/icons
 */

import type { ReactElement } from 'react'
import { ICONS, ICON_STROKE, STATUS_ICONS } from './icon-data.ts'

export interface IconProps {
  /** Rendered size in px (default 16). */
  readonly size?: number
  /** Extra class for state styling/animation. */
  readonly className?: string
  /** Accessible label; defaults to the icon's own label. */
  readonly label?: string
}

function IconSvg({ body, label, size = 16, className }: IconProps & { body: string }): ReactElement {
  return (
    <svg
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke='currentColor'
      strokeWidth={ICON_STROKE.width}
      strokeLinecap={ICON_STROKE.linecap}
      strokeLinejoin={ICON_STROKE.linejoin}
      className={className}
      role='img'
      aria-label={label}
    >
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  )
}

export type IconComponent = (props: IconProps) => ReactElement

/** Build one named icon component from the shared data table. */
function makeIcon(name: keyof typeof ICONS): IconComponent {
  const definition = ICONS[name]!
  function Component(props: IconProps): ReactElement {
    return <IconSvg body={definition.body} label={props.label ?? definition.label} {...props} />
  }
  return Component
}

/** Build one named status icon component. */
function makeStatusIcon(name: keyof typeof STATUS_ICONS): IconComponent {
  const definition = STATUS_ICONS[name]!
  function Component(props: IconProps): ReactElement {
    return <IconSvg body={definition.body} label={props.label ?? definition.label} {...props} />
  }
  return Component
}

export const TeamsXLogo = makeIcon('teams-x-logo')
export const RoleLead = makeIcon('role-lead')
export const RoleResearcher = makeIcon('role-researcher')
export const RoleEngineer = makeIcon('role-engineer')
export const RoleReviewer = makeIcon('role-reviewer')
export const RoleQa = makeIcon('role-qa')
export const RoleSecurity = makeIcon('role-security')
export const RoleDocs = makeIcon('role-docs')
export const RoleDesigner = makeIcon('role-designer')
export const RoleOperator = makeIcon('role-operator')
export const RoleData = makeIcon('role-data')

/** Role → icon map used by the roster renderer. */
export const ROLE_ICONS: Readonly<Record<string, IconComponent>> = {
  lead: RoleLead,
  captain: RoleLead,
  researcher: RoleResearcher,
  engineer: RoleEngineer,
  reviewer: RoleReviewer,
  qa: RoleQa,
  security: RoleSecurity,
  docs: RoleDocs,
  designer: RoleDesigner,
  operator: RoleOperator,
  data: RoleData,
}

export const ActionWorking = makeIcon('action-working')
export const ActionThinking = makeIcon('action-thinking')
export const ActionReporting = makeIcon('action-reporting')
export const ActionSending = makeIcon('action-sending')
export const ActionSleeping = makeIcon('action-sleeping')
export const ActionCelebrating = makeIcon('action-celebrating')

export const StatusOpen = makeStatusIcon('status-open')
export const StatusRunning = makeStatusIcon('status-running')
export const StatusBlocked = makeStatusIcon('status-blocked')
export const StatusCompleted = makeStatusIcon('status-completed')
export const StatusFailed = makeStatusIcon('status-failed')
export const StatusCancelled = makeStatusIcon('status-cancelled')

/** Visual task state → status icon map used by the DAG renderer. */
export const VISUAL_STATE_ICONS: Readonly<Record<string, IconComponent>> = {
  open: StatusOpen,
  running: StatusRunning,
  blocked: StatusBlocked,
  completed: StatusCompleted,
  failed: StatusFailed,
  cancelled: StatusCancelled,
}

/** Member activity → action icon map used by the roster renderer. */
export const ACTIVITY_ICONS: Readonly<Record<string, IconComponent>> = {
  working: ActionWorking,
  idle: ActionSleeping,
  unknown: ActionThinking,
}
