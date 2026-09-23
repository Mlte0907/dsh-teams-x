import type { ReactElement } from 'react';
import type { TeamActivityMessage, TeamActivityOperation, TeamActivitySnapshot } from '../snapshot-types.ts';
import type { Translate } from './format.ts';
/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void;
/** Stream filter: everything, tasks only, mail only, or one member's story. */
export type StreamFilter = 'all' | 'task' | 'msg' | {
    readonly member: string;
};
/** Human verb for an operation action; unmatched actions fall back to raw. */
export declare function operationVerb(t: Translate, action: string): string;
/** One merged, renderable stream row. */
export interface StreamEntry {
    readonly key: string;
    readonly kind: 'op' | 'inbox';
    readonly ts: number;
    readonly op?: TeamActivityOperation;
    readonly message?: TeamActivityMessage;
    /** Folded repeat count (1 = single event). */
    readonly count: number;
    /** True when this op is the newest event of its task (the card anchor). */
    readonly anchor: boolean;
}
/** Merge operations + mail into one newest-first stream with fold + anchors. */
export declare function buildStreamEntries(operations: readonly TeamActivityOperation[], messages: readonly TeamActivityMessage[]): StreamEntry[];
/** Apply a stream filter to merged entries (shared by the filter chips row). */
export declare function applyStreamFilter(entries: readonly StreamEntry[], filter: StreamFilter): readonly StreamEntry[];
export declare function TimelineStream({ team, t, openMember, readOnly, filter, decomposing, focusTaskId, onFocusHandled }: {
    team: TeamActivitySnapshot;
    t: Translate;
    openMember: OpenMember;
    readOnly?: boolean;
    filter: StreamFilter;
    decomposing: boolean;
    /** Transient locate request from the task meter; scrolls the anchor into view. */
    focusTaskId?: string;
    onFocusHandled?: () => void;
}): ReactElement;
