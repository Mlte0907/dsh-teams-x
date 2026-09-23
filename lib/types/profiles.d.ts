/**
 * Named team-profile templates: config types, normalization, invocation
 * parsing, and prompt rendering. Pure functions — no I/O, no spawn.
 *
 * Profiles let operators pre-define team rosters and seed tasks so
 * `teamsx_create({ profile: 'name' })` instantiates a known composition
 * instead of building from scratch every time.
 * @module dsh-teams-x/profiles
 */
/** Hard cap on named profiles so the usage prompt cannot grow without bound. */
export declare const MAX_TEAM_PROFILES = 16;
/** Hard cap on seed tasks per profile. The software-delivery example has 13. */
export declare const MAX_PROFILE_TASKS = 32;
/** Protocol excerpt length in the usage / prompt listing. */
export declare const PROFILE_PROTOCOL_PROMPT_LIMIT = 240;
/** One member row in a named team-profile template (unresolved). */
export interface TeamModelFallbackConfig {
    readonly provider: string;
    readonly model: string;
}
export interface TeamProfileMemberConfig {
    readonly name: string;
    readonly role?: string;
    readonly provider?: string;
    readonly model?: string;
    readonly reasoning_effort?: string;
    readonly executionPrompt?: string;
    readonly fallback?: TeamModelFallbackConfig;
}
/** One seed-task row in a named team-profile template (unresolved). */
export interface TeamProfileTaskConfig {
    readonly id: string;
    readonly subject: string;
    readonly description?: string;
    readonly assignee?: string;
    readonly dependencies?: string[];
}
/** One named team-profile template from plugin config. */
export interface TeamProfileConfig {
    readonly description?: string;
    readonly protocol?: string;
    readonly executionPrompt?: string;
    readonly fallback?: TeamModelFallbackConfig;
    readonly members: TeamProfileMemberConfig[];
    readonly tasks?: TeamProfileTaskConfig[];
    readonly taskPlanning?: 'captain' | 'seed';
    readonly reviewPolicy?: Record<string, unknown>;
}
/** A profile member after trim / pairing / reserved-name checks. */
export interface NormalizedProfileMember {
    readonly name: string;
    readonly role?: string;
    readonly provider?: string;
    readonly model?: string;
    readonly reasoningEffort?: string;
    readonly executionPrompt?: string;
    readonly fallback?: TeamModelFallbackConfig;
}
/** A profile seed task after assignee canonicalization; `sourceIndex` is the YAML order. */
export interface NormalizedProfileTask {
    readonly id: string;
    readonly subject: string;
    readonly description?: string;
    readonly assignee?: string;
    readonly dependencies: string[];
    readonly sourceIndex: number;
}
/** A fully validated, topologically ordered team profile. */
export interface NormalizedTeamProfile {
    readonly name: string;
    readonly description?: string;
    readonly protocol?: string;
    readonly executionPrompt?: string;
    readonly fallback?: TeamModelFallbackConfig;
    readonly taskPlanning: 'captain' | 'seed';
    readonly members: NormalizedProfileMember[];
    readonly tasks: NormalizedProfileTask[];
    readonly reviewPolicy?: Record<string, unknown>;
}
/** The goal + optional named profile extracted from a slash / gesture line. */
export interface AgentTeamsInvocation {
    readonly goal: string;
    readonly profile?: string;
}
/** One configured profile after key trim, for listing / lookup. */
export interface ListedTeamProfile {
    readonly name: string;
    readonly config: TeamProfileConfig;
}
/**
 * Trim every profile key once, reject empty / colliding keys, and reject
 * more than MAX_TEAM_PROFILES entries.
 */
/**
 * Built-in team templates (v0.4): usable without any plugin config. Members
 * without provider/model snapshot the captain's current route, so these work
 * on every deployment. User config overrides a built-in by the same name.
 */
export declare const BUILT_IN_TEAM_PROFILES: Record<string, TeamProfileConfig>;
export declare function listConfiguredProfiles(profiles: Record<string, TeamProfileConfig> | undefined | null): ListedTeamProfile[];
/** Render the usage-prompt listing. One line per profile; empty when nothing is configured. */
export declare function formatProfilesForPrompt(profiles: Record<string, TeamProfileConfig> | undefined | null): string;
/**
 * Extract a leading profile flag from an invocation string. Only a leading
 * `--profile <name>`, `--profile=<name>`, or `profile=<name>` counts; any
 * other first token means the entire string is the goal. Pure string
 * tokenization — no shell execution, no regex evaluation.
 */
export declare function parseProfileInvocation(rawInput: string): AgentTeamsInvocation;
/**
 * Normalize and pre-validate one named profile. Failures throw before any
 * caller should create a directory or spawn members.
 */
export declare function resolveTeamProfile(profiles: Record<string, TeamProfileConfig>, profileName: string, maxMembers: number): NormalizedTeamProfile;
/** Resolve the task-planning mode for a profile, defaulting to 'seed'. */
export declare function resolveProfileTaskPlanning(config: TeamProfileConfig | undefined): 'captain' | 'seed';
