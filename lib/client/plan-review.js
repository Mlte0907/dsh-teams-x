import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The staged-plan review bar: approve, return-to-chat, and discard (2-step).
 * Behavior-preserving extraction from ActivityPanel (v0.9 P0).
 * @module dsh-teams-x/client/plan-review
 */
import { useState } from 'react';
import { planAction } from "./api.js";
import css from './ActivityPanel.module.css';
export function PlanReviewBar({ team, t }) {
    const [busy, setBusy] = useState(undefined);
    const [discardArmed, setDiscardArmed] = useState(false);
    const [error, setError] = useState(undefined);
    const runnable = team.members.length > 0 && team.tasks.length > 0;
    const run = async (action) => {
        setBusy(action);
        setError(undefined);
        try {
            await planAction(team.captainSessionId, team.teamId, action);
            // No local state flip: the next poll reflects disk truth (phase flips to
            // running, or the team disappears into the archive) and unmounts us.
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setBusy(undefined);
        }
    };
    return (_jsxs("div", { className: css.planBar, role: 'group', "aria-label": t('plan.needsReview'), children: [_jsx("p", { className: css.planBarText, children: t('plan.needsReview') }), error !== undefined && _jsx("p", { className: css.planError, children: error }), _jsxs("div", { className: css.planActions, children: [_jsx("button", { type: 'button', className: css.planApprove, disabled: busy !== undefined || !runnable, title: runnable ? undefined : t('plan.notRunnable'), onClick: () => { void run('approve'); }, children: busy === 'approve' ? '…' : t('plan.approve') }), _jsx("button", { type: 'button', className: css.planChat, disabled: busy !== undefined, onClick: () => { void run('continue'); }, children: busy === 'continue' ? '…' : t('plan.returnToChat') }), discardArmed ? (_jsxs(_Fragment, { children: [_jsx("button", { type: 'button', className: css.planCancel, onClick: () => { setDiscardArmed(false); }, disabled: busy !== undefined, children: t('team.stopCancel') }), _jsx("button", { type: 'button', className: css.planDiscard, onClick: () => { void run('discard'); }, disabled: busy !== undefined, children: busy === 'discard' ? '…' : t('plan.discardConfirm') })] })) : (_jsx("button", { type: 'button', className: css.planDiscardArm, onClick: () => { setDiscardArmed(true); }, disabled: busy !== undefined, children: t('plan.discard') }))] })] }));
}
