/**
 * 脉搏层（live beats）— subscription-first member activity.
 *
 * The snapshot poll is the panel's backbone, but a fixed cadence is the wrong
 * physics for "did a member just start (or stop) working": the answer arrives
 * up to one poll interval late. This layer subscribes to the host session
 * faces for the members it can see and exposes their `running` bit as beats —
 * a working/idle flip lands within one host event, not one poll.
 *
 * Authority model, per member:
 *   1. a fresh beat (younger than the TTL) wins — the subscription is the
 *      fast path and corrects a stale poll within milliseconds;
 *   2. no beat / expired beat → the polled `activity` field stays
 *      authoritative, so members whose sessions were never materialized
 *      (cold subagents) behave exactly as before.
 *
 * Everything is feature-detected and try-caught: a host without the scope
 * face, or a session that refuses to scope, silently keeps poll authority.
 * @module dsh-teams-x/client/live-activity
 */
import { useEffect, useState } from 'react';
import { peekSessions } from "./client-runtime.js";
/** Beats older than this hand authority back to the poll. */
const BEAT_TTL_MS = 30_000;
/** Sweep cadence for expired beats. */
const SWEEP_INTERVAL_MS = 15_000;
/**
 * Subscribe to every listed member session that the host can scope. Re-runs
 * only when the id set changes (keyed by the joined ids, not the array
 * identity). Beat expiry is swept on a slow timer; subscriptions live for the
 * panel body's lifetime.
 */
export function useLiveBeats(memberIds) {
    const [beats, setBeats] = useState({});
    const idsKey = memberIds.join('\u0000');
    useEffect(() => {
        const sessions = peekSessions();
        if (sessions === undefined)
            return undefined;
        const ids = idsKey === '' ? [] : idsKey.split('\u0000');
        const disposers = new Map();
        const publish = (id, running) => {
            setBeats((prev) => {
                const current = prev[id];
                if (current !== undefined && current.running === running)
                    return prev;
                return { ...prev, [id]: { running, seenAt: Date.now() } };
            });
        };
        for (const id of ids) {
            if (id === '' || disposers.has(id))
                continue;
            try {
                const scope = sessions.scope(id);
                const face = scope === undefined ? undefined : sessions.sessionOf(scope);
                if (face === undefined)
                    continue;
                const onBeat = () => {
                    const snapshot = face.getSnapshot();
                    publish(id, snapshot.running);
                };
                const dispose = face.subscribe(onBeat);
                disposers.set(id, typeof dispose === 'function' ? dispose : () => { });
                onBeat();
            }
            catch {
                // Unmaterialized or unscopable member session: poll keeps authority.
            }
        }
        return () => {
            for (const dispose of disposers.values())
                dispose();
        };
    }, [idsKey]);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setBeats((prev) => {
                const now = Date.now();
                const expired = Object.keys(prev).filter((id) => now - (prev[id]?.seenAt ?? 0) > BEAT_TTL_MS);
                if (expired.length === 0)
                    return prev;
                const next = { ...prev };
                for (const id of expired)
                    delete next[id];
                return next;
            });
        }, SWEEP_INTERVAL_MS);
        return () => {
            window.clearInterval(timer);
        };
    }, []);
    return beats;
}
/**
 * Fold a member's beat into its polled activity: a fresh running beat reads
 * `working`; a fresh not-running beat demotes a polled `working` to `idle`
 * but never invents a state the poll never saw.
 */
export function beatActivity(activity, beat, now = Date.now()) {
    if (beat === undefined || now - beat.seenAt > BEAT_TTL_MS)
        return activity;
    if (beat.running)
        return 'working';
    return activity === 'working' ? 'idle' : activity;
}
