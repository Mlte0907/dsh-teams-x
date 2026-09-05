import { jsx as _jsx } from "react/jsx-runtime";
import { ICONS, ICON_STROKE, STATUS_ICONS } from "./icon-data.js";
function IconSvg({ body, label, size = 16, className }) {
    return (_jsx("svg", { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: ICON_STROKE.width, strokeLinecap: ICON_STROKE.linecap, strokeLinejoin: ICON_STROKE.linejoin, className: className, role: 'img', "aria-label": label, children: _jsx("g", { dangerouslySetInnerHTML: { __html: body } }) }));
}
/** Build one named icon component from the shared data table. */
function makeIcon(name) {
    const definition = ICONS[name];
    function Component(props) {
        return _jsx(IconSvg, { body: definition.body, label: props.label ?? definition.label, ...props });
    }
    return Component;
}
/** Build one named status icon component. */
function makeStatusIcon(name) {
    const definition = STATUS_ICONS[name];
    function Component(props) {
        return _jsx(IconSvg, { body: definition.body, label: props.label ?? definition.label, ...props });
    }
    return Component;
}
export const TeamsXLogo = makeIcon('teams-x-logo');
export const RoleLead = makeIcon('role-lead');
export const RoleResearcher = makeIcon('role-researcher');
export const RoleEngineer = makeIcon('role-engineer');
export const RoleReviewer = makeIcon('role-reviewer');
export const RoleQa = makeIcon('role-qa');
export const RoleSecurity = makeIcon('role-security');
export const RoleDocs = makeIcon('role-docs');
export const RoleDesigner = makeIcon('role-designer');
export const RoleOperator = makeIcon('role-operator');
export const RoleData = makeIcon('role-data');
/** Role → icon map used by the roster renderer. */
export const ROLE_ICONS = {
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
};
export const ActionWorking = makeIcon('action-working');
export const ActionThinking = makeIcon('action-thinking');
export const ActionReporting = makeIcon('action-reporting');
export const ActionSending = makeIcon('action-sending');
export const ActionSleeping = makeIcon('action-sleeping');
export const ActionCelebrating = makeIcon('action-celebrating');
export const StatusOpen = makeStatusIcon('status-open');
export const StatusRunning = makeStatusIcon('status-running');
export const StatusBlocked = makeStatusIcon('status-blocked');
export const StatusCompleted = makeStatusIcon('status-completed');
export const StatusFailed = makeStatusIcon('status-failed');
export const StatusCancelled = makeStatusIcon('status-cancelled');
/** Visual task state → status icon map used by the DAG renderer. */
export const VISUAL_STATE_ICONS = {
    open: StatusOpen,
    running: StatusRunning,
    blocked: StatusBlocked,
    completed: StatusCompleted,
    failed: StatusFailed,
    cancelled: StatusCancelled,
};
/** Member activity → action icon map used by the roster renderer. */
export const ACTIVITY_ICONS = {
    working: ActionWorking,
    idle: ActionSleeping,
    unknown: ActionThinking,
};
