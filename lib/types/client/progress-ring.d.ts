/**
 * Team progress instrument: a 24px SVG donut whose arc segments are the
 * task-status distribution (six states grouped into four; cancelled tasks are
 * excluded from the denominator so the ring always closes). The number beside
 * it carries the primary reading — the ring is the at-a-glance shape.
 * @module dsh-teams-x/client/progress-ring
 */
import type { ReactElement } from 'react';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
export interface TaskCounts {
    readonly completed: number;
    readonly running: number;
    readonly failed: number;
    readonly open: number;
    readonly cancelled: number;
    /** Denominator for progress: total minus cancelled. */
    readonly denom: number;
}
/** Group the six task statuses into the ring's four segments. */
export declare function countTasks(tasks: TeamActivitySnapshot['tasks']): TaskCounts;
export declare function ProgressRing({ tasks, size, ok, accent, bad, track, centerValue, centerLabel }: {
    tasks: TeamActivitySnapshot['tasks'];
    size?: number;
    /** Segment colors (CSS color strings from the --tx-* tokens). */
    readonly ok: string;
    readonly accent: string;
    readonly bad: string;
    readonly track: string;
    /** Big center reading (e.g. "2/4"), Token-Stats-donut style. */
    readonly centerValue: string;
    /** Small caption under the center value. */
    readonly centerLabel: string;
}): ReactElement;
