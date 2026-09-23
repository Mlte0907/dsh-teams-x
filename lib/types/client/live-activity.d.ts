/** One member's subscription-sourced activity bit. */
export interface LiveBeat {
    readonly running: boolean;
    readonly seenAt: number;
}
/** Beats keyed by member session id. */
export type LiveBeats = Readonly<Record<string, LiveBeat>>;
/**
 * Subscribe to every listed member session that the host can scope. Re-runs
 * only when the id set changes (keyed by the joined ids, not the array
 * identity). Beat expiry is swept on a slow timer; subscriptions live for the
 * panel body's lifetime.
 */
export declare function useLiveBeats(memberIds: readonly string[]): LiveBeats;
/**
 * Fold a member's beat into its polled activity: a fresh running beat reads
 * `working`; a fresh not-running beat demotes a polled `working` to `idle`
 * but never invents a state the poll never saw.
 */
export declare function beatActivity(activity: 'working' | 'idle' | 'unknown', beat: LiveBeat | undefined, now?: number): 'working' | 'idle' | 'unknown';
