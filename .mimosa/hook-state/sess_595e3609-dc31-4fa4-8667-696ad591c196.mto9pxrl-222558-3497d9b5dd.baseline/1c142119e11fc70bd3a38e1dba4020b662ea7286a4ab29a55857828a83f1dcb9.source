/**
 * TeamsX for DeepSeek Harness.
 *
 * A host-plane plugin that registers the `teamsx_*` tools and one usage
 * section into the global system prompt. After installation any session can
 * run multi-agent teamwork through natural language (e.g. "用 TeamsX 调研 X"):
 * the model creates a team (it becomes the captain), spawns members as
 * durable continuable subagents, breaks the goal into tasks with
 * dependencies, wakes members with messages, relays reports, and collects
 * results.
 *
 * The state dir is `.teams-x` and the tool namespace is `teamsx_*`, so this
 * plugin coexists with the original agent-teams plugin for comparison.
 *
 * @module dsh-teams-x
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "teams-x";
export declare const inject: string[];
/** Plugin configuration. */
export interface Config {
    /**
     * State directory name under the captain's workspace; team state lives at
     * `<workspace>/<stateDir>/<teamId>/` (default `.teams-x`).
     */
    stateDir?: string;
    /** `ctx.subagents` provider used to spawn members (default `spawn`). */
    memberProvider?: string;
    /** Optional model override applied to every member. */
    memberModel?: string;
    /** Prompt injected into member personas and automatic task assignments. */
    executionPrompt?: string;
    /** Plugin-wide fallback route for unavailable member models. */
    fallback?: {
        provider: string;
        model: string;
    };
    /** Member delegation depth cap (default `1`; `0` forbids delegation). */
    memberMaxDepth?: number;
    /** Team size cap in members (default `8`). */
    maxMembers?: number;
    /** Prompt-section order for the usage policy (default `118`). */
    promptSectionOrder?: number;
}
export declare const Config: z<Config>;
/** The model-facing usage policy: when and how to drive TeamsX. */
export declare function usageSectionText(toolNames: string): string;
export declare function apply(ctx: Context, config: Config): void;
