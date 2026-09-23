import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './ActivityPanel.module.css';
/** Group the six task statuses into the ring's four segments. */
export function countTasks(tasks) {
    const counts = { completed: 0, running: 0, failed: 0, open: 0, cancelled: 0 };
    for (const task of tasks) {
        if (task.status === 'cancelled') {
            counts.cancelled += 1;
            continue;
        }
        if (task.status === 'completed') {
            counts.completed += 1;
            continue;
        }
        if (task.status === 'in_progress' || task.status === 'claimed') {
            counts.running += 1;
            continue;
        }
        if (task.status === 'failed') {
            counts.failed += 1;
            continue;
        }
        counts.open += 1;
    }
    const denom = tasks.length - counts.cancelled;
    return { ...counts, denom };
}
export function ProgressRing({ tasks, size = 72, ok, accent, bad, track, centerValue, centerLabel }) {
    const counts = countTasks(tasks);
    const stroke = 7;
    const r = (size - stroke) / 2 - 1;
    const c = 2 * Math.PI * r;
    const arcs = counts.denom === 0 ? [] : [
        { color: ok, length: (counts.completed / counts.denom) * c },
        { color: accent, length: (counts.running / counts.denom) * c },
        { color: bad, length: (counts.failed / counts.denom) * c },
    ];
    let offset = 0;
    return (_jsxs("svg", { className: css.ringSvg, width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img', "aria-label": `${centerValue} ${centerLabel}`, children: [_jsxs("g", { transform: `rotate(-90 ${size / 2} ${size / 2})`, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, stroke: track, strokeWidth: stroke, fill: 'none' }), arcs.map((arc, index) => {
                        if (arc.length <= 0)
                            return null;
                        const dashOffset = -offset;
                        offset += arc.length;
                        return (_jsx("circle", { className: css.ringSeg, cx: size / 2, cy: size / 2, r: r, stroke: arc.color, strokeWidth: stroke, fill: 'none', strokeDasharray: `${arc.length} ${c - arc.length}`, strokeDashoffset: dashOffset }, index));
                    })] }), _jsx("text", { className: css.ringCenterValue, x: size / 2, y: size / 2 + 1, textAnchor: 'middle', dominantBaseline: 'middle', children: centerValue }), _jsx("text", { className: css.ringCenterLabel, x: size / 2, y: size / 2 + 14, textAnchor: 'middle', children: centerLabel })] }));
}
