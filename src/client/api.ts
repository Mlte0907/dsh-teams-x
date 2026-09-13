/**
 * Fetch/POST helpers for the plugin's host-plane routes. Leaf module: no
 * React, no component imports.
 * @module dsh-teams-x/client/api
 */
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import { TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL, TEAMSX_STATE_URL } from './endpoints.ts'

interface StateResponse {
  teams: TeamActivitySnapshot[]
}

/** Fetch the state endpoint (live or archived). */
export async function fetchTeams(viewMode: 'live' | 'archive'): Promise<TeamActivitySnapshot[]> {
  const url = viewMode === 'archive'
    ? `${TEAMSX_STATE_URL}?archived=1`
    : TEAMSX_STATE_URL
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const body = await response.json() as StateResponse
  return body.teams
}

/** POST the halt route for one team. */
export async function haltTeam(captainSessionId: string, teamId: string): Promise<void> {
  const response = await fetch(TEAMSX_HALT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

/** POST the pause route for one member (interrupt; attempt stays parked). */
export async function pauseMember(captainSessionId: string, teamId: string, memberName: string): Promise<void> {
  const response = await fetch(TEAMSX_PAUSE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId, memberName }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

/** POST one staged-plan review action. */
export async function planAction(
  captainSessionId: string,
  teamId: string,
  action: 'approve' | 'discard' | 'continue',
): Promise<void> {
  const response = await fetch(TEAMSX_PLAN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId, action }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}
