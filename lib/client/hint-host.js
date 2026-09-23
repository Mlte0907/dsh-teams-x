import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Global hint host for the `/teamsx` empty-state fallback.
 *
 * Mounted via the `sidebar.footer.action` slot (root scope, always present),
 * this component subscribes to the open-request unclaimed channel. When
 * `/teamsx` is invoked but no ActivityPanel is mounted to claim it (e.g. the
 * host home screen), a fixed-position overlay appears with a guidance message
 * and auto-dismisses after 6 seconds. Repeated triggers reset the timer
 * (renewal, not stacking).
 * @module dsh-teams-x/client/hint-host
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { onTeamsXPanelUnclaimed } from "./open-request.js";
import styles from './hint-host.module.css';
const AUTO_DISMISS_MS = 6000;
export function TeamsXHintHost(props) {
    const { t } = props;
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(undefined);
    useEffect(() => {
        const unsubscribe = onTeamsXPanelUnclaimed((_sessionId) => {
            setVisible(true);
            if (timerRef.current !== undefined)
                clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setVisible(false);
                timerRef.current = undefined;
            }, AUTO_DISMISS_MS);
        });
        return () => {
            unsubscribe();
            if (timerRef.current !== undefined)
                clearTimeout(timerRef.current);
        };
    }, []);
    if (!visible || typeof document === 'undefined')
        return null;
    return createPortal(_jsxs("div", { className: styles.hint, role: "status", "aria-live": "polite", children: [_jsx("span", { className: styles.message, children: t('command.panelUnavailable') }), _jsx("button", { className: styles.close, "aria-label": t('command.hintDismiss'), title: t('command.hintDismiss'), onClick: () => {
                    setVisible(false);
                    if (timerRef.current !== undefined) {
                        clearTimeout(timerRef.current);
                        timerRef.current = undefined;
                    }
                }, children: "\u00D7" })] }), document.body);
}
