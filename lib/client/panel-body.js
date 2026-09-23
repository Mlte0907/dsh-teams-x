import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The activity body every host shares: the live/archive toggle, refresh, the
 * error and empty states, and the team cards. Self-contained — it owns its
 * view mode and its polling — so the session-header dropdown, the right
 * Sidebar tab and the main-column panel are one component with one data path.
 * Behavior-preserving extraction from ActivityPanel (v0.9 P0).
 * @module dsh-teams-x/client/panel-body
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { makeT } from "./format.js";
import { fetchTeams } from "./api.js";
import { sameTeamsSnapshots } from "./snapshot-compare.js";
import { TeamCard } from "./team-card.js";
import css from './ActivityPanel.module.css';
import { GlyphClose, GlyphRefresh, TeamsXLogo } from "./icons.js";
/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000;
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export const DISCOVERY_INTERVAL_MS = 10_000;
/**
 * Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
 * fast when expanded); `archive` mode fetches once on mount and on
 * explicit reload only (static historical data, no auto-refresh).
 *
 * 静默轮询（quiet polling）: a tick whose payload would render identically
 * commits no state — same reference in, no re-render, control states stay
 * put. When a poll fails, the last-known-good list stays on screen and the
 * panel flips to `stale` (a quiet note, not an error wall); the error box is
 * reserved for "nothing to show at all". `busy` is the manual-reload spinner
 * only — background ticks are invisible unless data changed.
 */
export function useTeamData(expanded, viewMode) {
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState(undefined);
    const [stale, setStale] = useState(false);
    const [busy, setBusy] = useState(false);
    const [tick, setTick] = useState(0);
    // Once this session is known to host teams, the collapsed badge graduates
    // from the slow discovery cadence to the fast one — its working state (and
    // the badge breath) must light up within a poll, not two.
    const [fast, setFast] = useState(false);
    useEffect(() => {
        let disposed = false;
        const load = async () => {
            try {
                const data = await fetchTeams(viewMode);
                if (disposed)
                    return;
                setTeams((prev) => (sameTeamsSnapshots(prev, data) ? prev : data));
                setFast(data.length > 0);
                setError(undefined);
                setStale(false);
            }
            catch (cause) {
                if (disposed)
                    return;
                setError(cause instanceof Error ? cause.message : String(cause));
                setStale(true);
            }
            finally {
                if (!disposed)
                    setBusy(false);
            }
        };
        void load();
        if (viewMode === 'archive') {
            // Static historical data — fetch once, then only on explicit reload.
            return () => { disposed = true; };
        }
        const interval = expanded || fast ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS;
        const timer = window.setInterval(() => { void load(); }, interval);
        return () => {
            disposed = true;
            window.clearInterval(timer);
        };
    }, [expanded, viewMode, tick, fast]);
    const reload = useCallback(() => {
        setBusy(true);
        setTick((value) => value + 1);
    }, []);
    return { teams, error, stale, busy, reload };
}
export function TeamsXPanelBody({ sessionId, t, openMember, onClose }) {
    const translate = useMemo(() => makeT(t), [t]);
    const [viewMode, setViewMode] = useState('live');
    // A body renders only while its host shows it, so it always polls fast.
    const { teams, error, stale, busy, reload } = useTeamData(true, viewMode);
    const sessionTeams = useMemo(() => teams.filter((team) => (team.captainSessionId === sessionId
        || team.members.some((member) => member.id === sessionId))), [teams, sessionId]);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.panelHeader, children: [_jsxs("h2", { className: css.panelTitle, children: [_jsx(TeamsXLogo, { size: 18, decorative: true }), " ", translate('panel.title')] }), _jsxs("div", { className: css.panelActions, children: [_jsxs("div", { className: css.modeToggle, role: 'radiogroup', "aria-label": translate('panel.live'), children: [_jsx("button", { type: 'button', className: `${css.modeOption} ${viewMode === 'live' ? css.modeActive : ''}`, onClick: () => { setViewMode('live'); }, "aria-pressed": viewMode === 'live', children: translate('panel.live') }), _jsx("button", { type: 'button', className: `${css.modeOption} ${viewMode === 'archive' ? css.modeActive : ''}`, onClick: () => { setViewMode('archive'); }, "aria-pressed": viewMode === 'archive', children: translate('panel.archived') })] }), _jsx("button", { type: 'button', className: css.refreshButton, onClick: reload, "data-loading": busy === true || undefined, "aria-label": translate('panel.refresh'), title: translate('panel.refresh'), children: _jsx(GlyphRefresh, { size: 13, className: busy === true ? css.animSpin : undefined, decorative: true }) }), onClose !== undefined && (_jsx("button", { type: 'button', className: css.refreshButton, onClick: onClose, "aria-label": translate('panel.close'), title: translate('panel.close'), children: _jsx(GlyphClose, { size: 13, decorative: true }) }))] })] }), error !== undefined && sessionTeams.length > 0 && (_jsxs("div", { className: css.staleNote, role: 'status', children: [_jsx("span", { children: translate('panel.stale') }), _jsx("button", { type: 'button', className: css.staleRetry, onClick: reload, children: translate('panel.refresh') })] })), error !== undefined && sessionTeams.length === 0 && (_jsxs("div", { className: css.errorBox, children: [_jsx("p", { className: css.panelError, children: translate('panel.error', { message: error }) }), _jsx("button", { type: 'button', className: css.retryButton, onClick: reload, children: translate('panel.refresh') })] })), error === undefined && sessionTeams.length === 0 && (_jsxs("div", { className: css.emptyState, children: [_jsx(TeamsXLogo, { size: 48, className: css.emptyLogo }), _jsx("p", { className: css.panelEmpty, children: translate('panel.empty') })] })), _jsx("div", { className: css.teamList, children: sessionTeams.map((team) => _jsx(TeamCard, { team: team, t: translate, openMember: openMember, readOnly: viewMode === 'archive', onSaved: reload }, `${team.workspace}/${team.teamId}`)) })] }));
}
