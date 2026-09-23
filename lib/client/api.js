import { TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL, TEAMSX_STATE_URL } from "./endpoints.js";
/** Fetch the state endpoint (live or archived). */
export async function fetchTeams(viewMode) {
    const url = viewMode === 'archive'
        ? `${TEAMSX_STATE_URL}?archived=1`
        : TEAMSX_STATE_URL;
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    return body.teams;
}
/** POST the halt route for one team. */
export async function haltTeam(captainSessionId, teamId) {
    const response = await fetch(TEAMSX_HALT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
/** POST the pause route for one member (interrupt; attempt stays parked). */
export async function pauseMember(captainSessionId, teamId, memberName) {
    const response = await fetch(TEAMSX_PAUSE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId, memberName }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
/** POST one staged-plan review action. */
export async function planAction(captainSessionId, teamId, action) {
    const response = await fetch(TEAMSX_PLAN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: captainSessionId, teamId, action }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(body.error ?? `HTTP ${response.status}`);
    }
}
