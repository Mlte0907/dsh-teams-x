/**
 * Pinpoint exactly which isTeamState predicate fails for a given team.json.
 * Mirrors the predicates in src/state.ts one by one and prints the verdicts.
 * Usage: node --experimental-strip-types scripts/debug-validate.mjs <teamDir>
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const teamDir = process.argv[2]
if (teamDir === undefined) { console.error('usage: debug-validate.mjs <teamDir>'); process.exit(2) }
const raw = readFileSync(join(teamDir, 'team.json'), 'utf8')
const value = JSON.parse(raw.replace(/^\uFEFF/u, ''))

const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const isOptStr = (v) => v === undefined || typeof v === 'string'
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v)
const sanitizeKey = (name) => name.normalize('NFC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

const verdicts = []
const check = (name, ok) => { verdicts.push(`${ok ? 'ok  ' : 'FAIL'} ${name}`); return ok }

const id = value['id']
check('id matches dir name', typeof id === 'string')
check('name non-empty string', typeof value['name'] === 'string' && value['name'].trim() !== '')
check('description optional string', isOptStr(value['description']))
check('captainSessionId non-empty', typeof value['captainSessionId'] === 'string' && value['captainSessionId'] !== '')
check('createdAt finite', isFiniteNumber(value['createdAt']))
check('phase valid/undefined', value['phase'] === undefined || value['phase'] === 'staged' || value['phase'] === 'running', `phase=${JSON.stringify(value['phase'])}`)
check('planReviewState valid/undefined', value['planReviewState'] === undefined
  || value['planReviewState'] === 'awaiting_review' || value['planReviewState'] === 'awaiting_feedback',
  `planReviewState=${JSON.stringify(value['planReviewState'])}`)
check('approvedAt finite/undefined', value['approvedAt'] === undefined || isFiniteNumber(value['approvedAt']))
check('halted bool/undefined', value['halted'] === undefined || typeof value['halted'] === 'boolean')
check('haltedAt finite/undefined', value['haltedAt'] === undefined || isFiniteNumber(value['haltedAt']))
check('taskSeq safe int >= 0', Number.isSafeInteger(value['taskSeq']) && value['taskSeq'] >= 0)

const staged = value['phase'] === 'staged'
const memberKeys = new Set()
const memberIds = new Set()
for (const [index, member] of (value['members'] ?? []).entries()) {
  const m = `members[${index}] "${member?.name}"`
  check(`${m} isRecord`, isRecord(member))
  if (!isRecord(member)) continue
  check(`${m} id string`, typeof member['id'] === 'string')
  check(`${m} name non-empty`, typeof member['name'] === 'string' && member['name'].trim() !== '')
  check(`${m} role/provider/model/reasoningEffort/activeProvider/activeModel optional strings`,
    isOptStr(member['role']) && isOptStr(member['provider']) && isOptStr(member['model'])
    && isOptStr(member['reasoningEffort']) && isOptStr(member['activeProvider']) && isOptStr(member['activeModel']))
  check(`${m} executionPrompt optional string`, member['executionPrompt'] === undefined || typeof member['executionPrompt'] === 'string')
  check(`${m} fallback shape`, member['fallback'] === undefined
    || (isRecord(member['fallback']) && typeof member['fallback']['provider'] === 'string' && typeof member['fallback']['model'] === 'string'))
  check(`${m} fallbackActive bool/undefined`, member['fallbackActive'] === undefined || typeof member['fallbackActive'] === 'boolean')
  check(`${m} joinedAt finite`, isFiniteNumber(member['joinedAt']), `joinedAt=${JSON.stringify(member['joinedAt'])}`)
  check(`${m} status idle|working|removed`, member['status'] === 'idle' || member['status'] === 'working' || member['status'] === 'removed',
    `status=${JSON.stringify(member['status'])}`)
  const key = sanitizeKey(String(member['name'] ?? ''))
  check(`${m} key not captain & unique`, key !== 'captain' && !memberKeys.has(key), `key=${key}`)
  check(`${m} id non-empty when not staged`, staged || member['id'] !== '')
  check(`${m} id unique`, member['id'] === '' || !memberIds.has(member['id']))
  memberKeys.add(key)
  if (member['id'] !== '') memberIds.add(member['id'])
}
const taskIds = new Set()
for (const [index, task] of (value['tasks'] ?? []).entries()) {
  const t = `tasks[${index}] "${task?.id}"`
  check(`${t} isRecord`, isRecord(task))
  if (!isRecord(task)) continue
  check(`${t} id/subject strings`, typeof task['id'] === 'string' && typeof task['subject'] === 'string')
  check(`${t} status valid`, ['pending', 'claimed', 'in_progress', 'completed', 'failed', 'cancelled'].includes(task['status']),
    `status=${JSON.stringify(task['status'])}`)
  check(`${t} description/assignee/output/attemptId/handoffId optional strings`,
    isOptStr(task['description']) && isOptStr(task['assignee']) && isOptStr(task['output'])
    && isOptStr(task['attemptId']) && isOptStr(task['handoffId']))
  check(`${t} dependencies string[]`, Array.isArray(task['dependencies']) && task['dependencies'].every((d) => typeof d === 'string'))
  check(`${t} attempt safe int >=0`, task['attempt'] === undefined || (Number.isSafeInteger(task['attempt']) && task['attempt'] >= 0))
  check(`${t} reassigning bool/undefined`, task['reassigning'] === undefined || typeof task['reassigning'] === 'boolean')
  check(`${t} kind string/undefined`, task['kind'] === undefined || typeof task['kind'] === 'string')
  check(`${t} createdAt/updatedAt finite`, isFiniteNumber(task['createdAt']) && isFiniteNumber(task['updatedAt']))
  check(`${t} id non-empty & unique`, task['id'] !== '' && !taskIds.has(task['id']))
  taskIds.add(task['id'])
}

console.log(verdicts.join('\n'))
const failed = verdicts.filter((v) => v.startsWith('FAIL'))
console.log(failed.length === 0 ? '\nALL PREDICATES PASS (failure is elsewhere!)' : `\n${failed.length} FAILING PREDICATE(S)`)
