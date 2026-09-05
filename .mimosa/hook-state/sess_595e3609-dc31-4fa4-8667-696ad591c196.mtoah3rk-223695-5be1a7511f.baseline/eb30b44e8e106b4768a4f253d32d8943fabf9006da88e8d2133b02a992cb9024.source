/**
 * Team activity snapshot assembly for the activity panel.
 *
 * Server-side assembly: read the durable team files (the truth source) and
 * enrich with live subagent activity, so the panel always reflects the
 * on-disk state even when a model skipped a tool call. Mailbox reads run in
 * parallel, and the dependency lookup map is built once per team.
 * @module dsh-teams-x/snapshot
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TeamState } from './types.ts';
import type { TeamActivitySnapshot } from './snapshot-types.ts';
export type { TeamActivityMember, TeamActivityMessage, TeamActivitySnapshot, TeamActivityTask, } from './snapshot-types.ts';
/** Snapshot projection switches for live and archived teams. */
export interface TeamSnapshotOptions {
    /** Historic review must retain members that were marked removed at shutdown. */
    readonly includeRemoved?: boolean;
    /** Archived teams have no meaningful live activity after their sessions stop. */
    readonly historic?: boolean;
}
/** Compact `provider/model` route for the activity panel, or just the model. */
export declare function memberModelRoute(member: {
    provider?: string;
    model?: string;
} | undefined): string;
/**
 * Assemble one team snapshot from its durable files plus live activity.
 * @param ctx - the plugin context (injects `agents`, used for activity).
 * @param stateRoot - resolved absolute state root of the owning workspace.
 * @param workspace - display name of the owning workspace.
 * @param state - the durable team record.
 */
export declare function assembleTeamSnapshot(ctx: Context, stateRoot: string, workspace: string, state: TeamState, options?: TeamSnapshotOptions): Promise<TeamActivitySnapshot>;
/**
 * Collect every team under the given workspace state roots.
 * @returns the snapshots in stable order (workspace, then team id).
 */
export declare function collectTeamsActivity(ctx: Context, roots: readonly {
    workspace: string;
    stateRoot: string;
}[]): Promise<TeamActivitySnapshot[]>;
/**
 * Collect every archived team under the given workspace state roots (the
 * `archive/` subdirectory of each state root).
 */
export declare function collectArchivedTeamsActivity(ctx: Context, roots: readonly {
    workspace: string;
    stateRoot: string;
}[]): Promise<TeamActivitySnapshot[]>;
