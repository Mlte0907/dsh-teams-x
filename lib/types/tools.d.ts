/**
 * The `teamsx_*` model-facing tools.
 *
 * The captain (the agent that created the team) orchestrates: members are
 * continuable subagents it spawns and wakes. Members share the same tools
 * and drive their own task state: create team (staged by default) →
 * add members → create tasks with dependencies → claim/assign → work →
 * report → status → delete.
 * @module dsh-teams-x/tools
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { StagedPlanMutation } from './snapshot-types.ts';
import type { TeamState } from './types.ts';
/** Resolved plugin config consumed by the tools. */
export interface ToolsConfig {
    /** State directory name under the captain's workspace. */
    stateDir: string;
    /** Member subagent provider name. */
    memberProvider: string;
    /** Optional member model override. */
    memberModel?: string;
    /** Prompt injected into member personas and assignments. */
    executionPrompt?: string;
    /** Plugin-wide fallback route. */
    fallback?: {
        provider: string;
        model: string;
    };
    /** Member delegation depth cap. */
    memberMaxDepth?: number;
    /** Team size cap (members). */
    maxMembers: number;
    /** Named team profile templates. */
    profiles?: Record<string, import('./profiles.ts').TeamProfileConfig>;
    /** Automatic repair loop config. */
    repairLoop?: import('./scheduler.ts').RepairLoopConfig;
}
/** Re-exported from the zero-import snapshot module so the client editor can
 * share the exact mutation vocabulary without importing the host graph. */
export type { StagedPlanMutation } from './snapshot-types.ts';
/** Hard cap on one browser edit batch. */
export declare const MAX_STAGED_PLAN_MUTATIONS = 64;
/**
 * Strict runtime validation for browser-supplied staged-plan mutations.
 *
 * Unknown actions MUST be rejected here: the batch runner's final else-branch
 * treats any unrecognized action as remove_member, so a typo from the web
 * plane must never reach it. The web route cannot rely on TypeScript for this
 * boundary — the payload arrives as parsed JSON.
 */
export declare function parseStagedPlanMutations(input: unknown): StagedPlanMutation[];
/** Runtime bridge shared by model-facing tools and the Web surface. */
export interface TeamsXRuntime {
    updateStagedPlan(captain: Agent, teamId: string, mutation: StagedPlanMutation, signal?: AbortSignal): Promise<TeamState>;
    updateStagedPlanBatch(captain: Agent, teamId: string, mutations: readonly StagedPlanMutation[], signal?: AbortSignal): Promise<TeamState>;
    approveStagedTeam(captain: Agent, teamId: string, signal?: AbortSignal): Promise<{
        teamId: string;
        members: number;
        tasks: number;
    }>;
    continueStagedPlanning(captain: Agent, teamId: string): Promise<{
        teamId: string;
        alreadyWaiting: boolean;
    }>;
    discardStagedTeam(captain: Agent, teamId: string): Promise<{
        teamId: string;
    }>;
}
export declare function haltTeamWork(input: {
    ctx: Context;
    stateRoot: string;
    teamId: string;
    captain: Agent;
    signal?: AbortSignal;
}): Promise<{
    teamName: string;
    cancelledTasks: number;
    alreadyHalted: boolean;
}>;
/** Context queued after the human rejects a staged plan. */
export declare function stagedPlanDiscardContext(teamName: string): string;
/** Context queued when the user returns a staged plan to chat for revision. */
export declare function stagedPlanFeedbackContext(teamName: string): string;
/**
 * Register every `teamsx_*` tool into the shared tools registry.
 * @param ctx - the plugin context (injects `tools`).
 * @param config - resolved tool config.
 */
export declare function registerTeamsXTools(ctx: Context, config: ToolsConfig): TeamsXRuntime;
