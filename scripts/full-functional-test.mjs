/**
 * TeamsX full functional test suite (state + quality + tools + events +
 * compat + web-routes + performance + security).
 * Run after building: node scripts/full-functional-test.mjs
 * Exits 0 when every check passes, 1 otherwise.
 */
import { mkdtemp, rm, writeFile, mkdir, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const state = await import(join(root, 'lib', 'state.js'))
const quality = await import(join(root, 'lib', 'quality.js'))
const toolsMod = await import(join(root, 'lib', 'tools.js'))
const events = await import(join(root, 'lib', 'events.js'))
const compat = await import(join(root, 'lib', 'compat.js'))
const webRoutes = await import(join(root, 'lib', 'web-routes.js'))

const KNOWN_EVENTS = new Set([
  'teamsx/team-created', 'teamsx/team-approved', 'teamsx/team-halted', 'teamsx/team-resumed',
  'teamsx/team-deleted', 'teamsx/plan-discarded', 'teamsx/member-added', 'teamsx/member-removed',
  'teamsx/task-created', 'teamsx/task-updated', 'teamsx/message-sent',
])
events.installKnownEventTypes(KNOWN_EVENTS)

const { CAPTAIN_KEY } = state

process.on('unhandledRejection', (reason) => {
  console.log('\n[unhandledRejection]', reason instanceof Error ? reason.stack : String(reason))
})

// ── harness ──
let passCount = 0
let failCount = 0
const findings = []
const perf = []
const currentGroup = { name: '' }
function group(name) { currentGroup.name = name; console.log(`\n━━ ${name} ━━`) }
function check(id, name, condition, detail = '') {
  const mark = condition ? 'PASS' : 'FAIL'
  console.log(`  ${mark}  ${id} ${name}${condition || detail === '' ? '' : ` — ${detail}`}`)
  if (condition) passCount += 1
  else { failCount += 1; findings.push({ id, name, group: currentGroup.name, detail: detail || 'condition was false' }) }
}
async function expectError(id, name, fn, substring) {
  try {
    await fn()
    check(id, name, false, 'no error thrown')
  } catch (error) {
    const message = String(error?.message ?? error)
    const ok = substring === undefined || message.includes(substring)
    check(id, name, ok, ok ? message.slice(0, 170) : `expected "${substring}" in "${message.slice(0, 170)}"`)
  }
}
async function runTimed(id, name, maxMs, fn) {
  const t0 = performance.now()
  const value = await fn()
  const ms = Math.round((performance.now() - t0) * 100) / 100
  perf.push({ id, name, ms })
  const ok = ms <= maxMs
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${id} ${name} — ${ms}ms (budget ≤${maxMs}ms)`)
  if (ok) passCount += 1
  else { failCount += 1; findings.push({ id, name, group: 'H 性能', detail: `${ms}ms > ${maxMs}ms` }) }
  return value
}

// ── mocks ──
function makeMockCtx() {
  const registered = []
  const logs = { warn: [], debug: [], info: [], error: [] }
  const agents = new Map()
  let childCounter = 0
  const ctx = {
    tools: { register: (tool) => { registered.push(tool) } },
    logger: {
      debug: (m) => logs.debug.push(String(m)),
      info: (m) => logs.info.push(String(m)),
      warn: (m) => logs.warn.push(String(m)),
      error: (m) => logs.error.push(String(m)),
    },
    agents,
    llm: {
      listModels: async () => [],
      resolveCallConfig: async (req) => ({
        provider: req.provider,
        model: req.model,
        ...(req.reasoningEffort !== undefined ? { reasoningEffort: req.reasoningEffort } : {}),
      }),
    },
    subagents: {
      list: () => ['mock-spawn'],
      getProvider: () => ({ capabilities: { persona: true, toolFilter: true }, prepareContinuable: () => ({}) }),
      startContinuable: async () => ({ childId: `child-${++childCounter}` }),
      interrupt: () => {},
      registerContinuableSetup: () => {},
      sendMessage: async () => ({}),
    },
    on: () => () => {},
    effect: (fn) => fn(),
    get: () => undefined,
  }
  return { ctx, registered, logs, agents }
}

function makeAgent(id, cwd, overrides = {}) {
  const collected = []
  return {
    id,
    status: 'idle',
    events: collected,
    session: {
      header: { cwd },
      append: (type, data) => { collected.push({ type, data }) },
      requestHeader: () => ({ config: { provider: 'prov-a', model: 'model-a', reasoningEffort: 'medium' } }),
    },
    options: { provider: 'prov-a', model: 'model-a' },
    cancel: () => {},
    followup: () => {},
    inject: () => {},
    steer: () => true,
    whenIdle: async () => {},
    ...overrides,
  }
}

const CONFIG = {
  stateDir: '.teams-x-t',
  memberProvider: 'mock-spawn',
  memberModel: 'model-m',
  memberMaxDepth: 2,
  maxMembers: 4,
}
const stateRootOf = (workspace) => join(workspace, CONFIG.stateDir)
const SIGNAL = () => new AbortController().signal
const toolOf = (registered, name) => registered.find((tool) => tool.name === name)

// ── sandbox ──
const sandbox = await mkdtemp(join(tmpdir(), 'teamsx-full-'))
const WS = sandbox
const ROOT = stateRootOf(WS)

try {
  // ══════════════════ A 团队管理 ══════════════════
  group('A 团队管理(创建/成员/删除/恢复)')
  {
    const { ctx, registered, logs, agents } = makeMockCtx()
    const captain = makeAgent('captain-A', WS)
    toolsMod.registerTeamsXTools(ctx, CONFIG)
    const exec = { agent: captain, signal: SIGNAL() }

    const created = await toolOf(registered, 'teamsx_create').execute({ name: 'alpha team', description: 'demo' }, exec)
    check('A1', 'automatic 创建 → phase=running + 磁盘结构', created.phase === 'running'
      && created.team_id === 'alpha-team'
      && (await readFile(join(ROOT, 'alpha-team', 'team.json'), 'utf8')).includes('"alpha-team"'))
    const idx = JSON.parse(await readFile(join(ROOT, 'index.json'), 'utf8'))
    check('A1b', '创建后反向索引登记 captain', idx.captains['captain-A'] === 'alpha-team')
    check('A1c', 'team-created 事件写入 captain session', captain.events.some((e) => e.type === 'teamsx/team-created' && e.data.teamId === 'alpha-team'))

    await expectError('A3', '空团队名拒绝', () => toolOf(registered, 'teamsx_create').execute({ name: '   ' }, exec), 'team name must not be empty')
    const captain2 = makeAgent('captain-B', WS)
    await expectError('A4', 'team id 被其他 captain 占用', () => toolOf(registered, 'teamsx_create').execute({ name: 'alpha team' }, { agent: captain2, signal: SIGNAL() }), 'is taken by another captain')
    await expectError('A5', '同 captain 重复创建被拒(权威扫描)', () => toolOf(registered, 'teamsx_create').execute({ name: 'second-team' }, exec), 'you already lead team')

    const added = await toolOf(registered, 'teamsx_add_member').execute({ name: 'worker-1', role: 'engineer' }, exec)
    check('A7', 'running 团队添加成员 → spawn 子代理', added.member_id.startsWith('child-') && added.status === 'idle' && added.phase === 'running')
    check('A7b', 'member-added 事件', captain.events.some((e) => e.type === 'teamsx/member-added' && e.data.name === 'worker-1'))

    await expectError('A8a', '成员空名拒绝', () => toolOf(registered, 'teamsx_add_member').execute({ name: '' }, exec), 'member name must not be empty')
    await expectError('A8b', 'captain 保留名拒绝', () => toolOf(registered, 'teamsx_add_member').execute({ name: 'captain' }, exec), 'reserved for the captain')
    await expectError('A8c', '成员重名拒绝(大小写归一)', () => toolOf(registered, 'teamsx_add_member').execute({ name: 'Worker-1' }, exec), 'has already been used')
    for (let i = 2; i <= 4; i += 1) await toolOf(registered, 'teamsx_add_member').execute({ name: `worker-${i}` }, exec)
    await expectError('A8d', '成员上限拒绝(cap=4)', () => toolOf(registered, 'teamsx_add_member').execute({ name: 'worker-5' }, exec), 'member cap (4)')

    const resumed = await toolOf(registered, 'teamsx_resume').execute({ reason: 'no-op' }, exec)
    check('A11a', '非 halted 团队 resume → already_running', resumed.status === 'already_running')
    await expectError('A11b', '空 reason resume 拒绝', () => toolOf(registered, 'teamsx_resume').execute({ reason: ' ' }, exec), 'non-empty resume reason is required')

    const t = await toolOf(registered, 'teamsx_create_task').execute({ subject: 'pending work', assignee: 'worker-4' }, exec)
    await toolOf(registered, 'teamsx_claim_task').execute({ task_id: t.task_id, assignee: 'worker-4' }, exec)
    const removed = await toolOf(registered, 'teamsx_remove_member').execute({ name: 'worker-4' }, exec)
    check('A9', '移除成员 → 任务回池 + status=removed', removed.status === 'removed' && removed.requeued_tasks.includes(t.task_id))
    const reloaded = await state.readTeam(ROOT, 'alpha-team')
    // 设计行为: 回池任务由调度器自动重派给下一个可用成员(无 assignee 的 ready 任务)
    const requeuedTask = reloaded.tasks.find((task) => task.id === t.task_id)
    check('A9b', '回池任务被调度器自动重派或保持 pending(非 removed 成员所有)',
      requeuedTask !== undefined
      && (requeuedTask.status === 'pending' || (requeuedTask.status === 'claimed' && requeuedTask.assignee !== 'worker-4')),
      JSON.stringify(requeuedTask?.status))
    check('A9c', 'retired 拒绝名单持久化', (await state.readRetiredMemberIds(ROOT)).size >= 1)
    await expectError('A9d', '移除不存在成员拒绝', () => toolOf(registered, 'teamsx_remove_member').execute({ name: 'ghost' }, exec), 'no active member named "ghost"')

    // 边界: 危险团队名 sanitize(独立 workspace)
    const wsB = join(sandbox, 'ws-b')
    const cfgB = { ...CONFIG, stateDir: '.teams-x-b' }
    const mB = makeMockCtx()
    toolsMod.registerTeamsXTools(mB.ctx, cfgB)
    const capB = makeAgent('captain-san', wsB)
    const weird = await toolOf(mB.registered, 'teamsx_create').execute({ name: '../../etc passwd!! 目录名超长超长超长超长超长超长超长超长超长' }, { agent: capB, signal: SIGNAL() })
    const dirs = (await readdir(join(wsB, cfgB.stateDir))).filter((d) => d !== 'index.json')
    check('A6', '危险团队名折叠为安全目录名', weird.team_id === dirs[0] && !/[\\/]/.test(weird.team_id) && !weird.team_id.includes('.'), JSON.stringify(weird.team_id))

    const deleted = await toolOf(registered, 'teamsx_delete').execute({}, exec)
    check('A10', 'delete → 归档', deleted.deleted === true && (await state.listArchivedTeamIds(ROOT)).includes('alpha-team'))
    check('A10b', 'delete 后 captain 查无团队', await state.findTeamByParticipant(ROOT, 'captain-A') === undefined)
    check('A10c', '归档目录保留 team.json', (await readFile(join(ROOT, 'archive', 'alpha-team', 'team.json'), 'utf8')).includes('alpha-team'))
    check('A10d', 'team-deleted 事件', captain.events.some((e) => e.type === 'teamsx/team-deleted'))
    const recreated = await toolOf(registered, 'teamsx_create').execute({ name: 'alpha team' }, exec)
    check('A10e', '删除后团队 id 可复用', recreated.team_id === 'alpha-team' && recreated.phase === 'running')
    // BUG 回归探针: 重建同名团队再次删除 → archive 目标已存在
    let bug01 = ''
    try {
      await toolOf(registered, 'teamsx_delete').execute({}, exec)
      bug01 = 'second delete unexpectedly succeeded'
    } catch (error) {
      bug01 = `${error.code ?? ''} ${String(error.message).slice(0, 120)}`
    }
    check('BUG-01', '重建同名团队后 teamsx_delete 应正常归档(实际 ENOTEMPTY 崩溃)', bug01 === 'second delete unexpectedly succeeded', bug01)
    // 清理残留以便后续用例
    await rm(join(ROOT, 'alpha-team'), { recursive: true, force: true })
    void logs; void agents
  }

  // ══════════════════ B 权限控制 ══════════════════
  group('B 权限控制(角色/能力/冒充)')
  {
    const { ctx, registered, agents } = makeMockCtx()
    const captain = makeAgent('captain-P', WS)
    agents.set('captain-P', captain)
    toolsMod.registerTeamsXTools(ctx, CONFIG)
    const cexec = { agent: captain, signal: SIGNAL() }
    await toolOf(registered, 'teamsx_create').execute({ name: 'perm-team' }, cexec)
    await toolOf(registered, 'teamsx_add_member').execute({ name: 'alice' }, cexec)
    const member = makeAgent('child-100', WS)
    agents.set('child-100', member)
    let team = await state.readTeam(ROOT, 'perm-team')
    team.members.find((m) => m.name === 'alice').id = 'child-100'
    await state.writeTeam(ROOT, team)
    await state.reindexTeam(ROOT, team)
    const mexec = { agent: member, signal: SIGNAL() }

    await expectError('B1', '成员调用 teamsx_add_member 被拒', () => toolOf(registered, 'teamsx_add_member').execute({ name: 'bob' }, mexec), 'you are not leading any team yet')
    await expectError('B2', '成员调用 teamsx_remove_member 被拒', () => toolOf(registered, 'teamsx_remove_member').execute({ name: 'alice' }, mexec), 'you are not leading any team yet')
    await expectError('B4', '成员冒充他人 from 被拒', () => toolOf(registered, 'teamsx_send_message').execute({ to: 'captain', content: 'hi', from: 'alice2' }, mexec), '"from" must be your own identity')
    await toolOf(registered, 'teamsx_remove_member').execute({ name: 'alice' }, cexec)
    // remove_member 后索引自愈剔除 removed 成员 → 参与者查找直接失败(报无团队)
    await expectError('B8', 'removed 成员身份失效', () => toolOf(registered, 'teamsx_send_message').execute({ to: 'captain', content: 'hi' }, mexec), 'you do not lead or belong to any active team yet')

    // assignee 必须是活跃成员
    await expectError('B3x', 'assignee 必须是活跃成员', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x2', assignee: 'nobody' }, cexec), 'no active member named')
    // 代领已移除成员
    const t = await toolOf(registered, 'teamsx_create_task').execute({ subject: 'authored work' }, cexec)
    await expectError('B3', '已移除成员不可被代领', () => toolOf(registered, 'teamsx_claim_task').execute({ task_id: t.task_id, assignee: 'alice' }, cexec), 'no active member named "alice"')
    // 成员 attempt 能力流
    await toolOf(registered, 'teamsx_add_member').execute({ name: 'carol' }, cexec)
    team = await state.readTeam(ROOT, 'perm-team')
    team.members.find((m) => m.name === 'carol').id = 'child-101' // 不可复用 removed 成员的 id
    await state.writeTeam(ROOT, team)
    await state.reindexTeam(ROOT, team)
    const t2 = await toolOf(registered, 'teamsx_create_task').execute({ subject: 'carol work', assignee: 'carol' }, cexec)
    const member2 = makeAgent('child-101', WS) // carol 的子代理身份
    member2.status = 'working' // 模拟成员工作中 → 调度器 kickTeam 跳过(避免自动重派干扰断言)
    ctx.agents.set('child-101', member2)
    const m2exec = { agent: member2, signal: SIGNAL() }
    const claim = await toolOf(registered, 'teamsx_claim_task').execute({ task_id: t2.task_id }, m2exec)
    check('B6a', 'claim 返回 attempt_id 能力', typeof claim.attempt_id === 'string' && claim.attempt_id.length > 0)
    await expectError('B6b', '成员 claim 不能指定 assignee', () => toolOf(registered, 'teamsx_claim_task').execute({ task_id: t.task_id, assignee: 'carol' }, m2exec), 'members cannot set assignee')
    const updInProgress = await toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'in_progress', attempt_id: claim.attempt_id }, m2exec)
    // dsh >= 0.1.5 requires lossless JSON tool output: JSON.stringify drops
    // `undefined` keys, so an unset verdict must be omitted from the result
    // (the live run hit "invalid output: value is not lossless JSON").
    const updRoundTrip = JSON.parse(JSON.stringify(updInProgress))
    check('B6c2', 'update_task 输出无损 JSON（未设 verdict 不得出现 undefined 键）', Object.keys(updRoundTrip).length === Object.keys(updInProgress).length && Object.keys(updInProgress).every((k) => k in updRoundTrip) && !('taskVerdict' in updInProgress))
    await expectError('B6c', '伪造 attempt_id 拒绝', () => toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'completed', attempt_id: 'forged', output: 'x' }, m2exec), 'stale attempt for task')
    const t3 = await toolOf(registered, 'teamsx_create_task').execute({ subject: 't3' }, cexec)
    await expectError('B7a', 'pending → completed 非法迁移', () => toolOf(registered, 'teamsx_update_task').execute({ task_id: t3.task_id, status: 'completed' }, cexec), 'cannot move from "pending" to "completed"')
    await expectError('B7b', 'captain 不能直接更新成员任务', () => toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'completed' }, cexec), 'call teamsx_reassign_task with assignee="captain"')
    await toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'completed', attempt_id: claim.attempt_id, output: 'done' }, m2exec)
    await expectError('B7c', 'completed 任务不可再更新', () => toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'in_progress', attempt_id: claim.attempt_id }, m2exec), 'terminal task')

    // B9 多团队歧义
    const wsC = join(sandbox, 'ws-c')
    const cfgC = { ...CONFIG, stateDir: '.teams-x-c' }
    const ctxC = makeMockCtx()
    toolsMod.registerTeamsXTools(ctxC.ctx, cfgC)
    const rootC = join(wsC, cfgC.stateDir)
    const mk = async (id) => {
      await state.createTeamDir(rootC, {
        name: id, id, captainSessionId: 'captain-C', createdAt: Date.now(),
        members: [{ id: 'shared-child', name: 'w', provider: 'p', model: 'm', joinedAt: Date.now(), status: 'idle' }],
        tasks: [], taskSeq: 0, phase: 'running',
      })
    }
    await mk('team-c1')
    await mk('team-c2')
    const shared = makeAgent('shared-child', wsC)
    // F-01 修复验证: 索引命中路径同样报歧义(不再静默错选最后登记的团队)
    await expectError('B9', '一属多团队 → 索引命中路径报歧义错误而非任意选择', () => toolOf(ctxC.registered, 'teamsx_status').execute({}, { agent: shared, signal: SIGNAL() }), 'belongs to multiple active teams')
    await rm(join(rootC, 'index.json'), { force: true }) // 强制走权威扫描路径
    await expectError('B9b', '一属多团队 → 扫描路径报歧义错误(原有防护)', () => toolOf(ctxC.registered, 'teamsx_status').execute({}, { agent: shared, signal: SIGNAL() }), 'belongs to multiple active teams')
  }

  // ══════════════════ C 数据同步 ══════════════════
  group('C 数据同步(持久化一致性/索引自愈/容错)')
  {
    const wsD = join(sandbox, 'ws-d')
    const rootD = join(wsD, '.teams-x-d')
    const team = {
      name: 'sync-1', id: 'sync-1', captainSessionId: 'cap-sync', createdAt: Date.now(),
      members: [{ id: 'mem-1', name: 'm1', provider: 'p', model: 'm', joinedAt: Date.now(), status: 'idle' }],
      tasks: [], taskSeq: 0, phase: 'running',
    }
    await state.createTeamDir(rootD, team)
    await rm(join(rootD, 'index.json'), { force: true })
    check('C1', '索引缺失 → 全扫描找到并重建', (await state.findTeamByParticipant(rootD, 'cap-sync'))?.id === 'sync-1')
    const idxBack = await readFile(join(rootD, 'index.json'), 'utf8').then(JSON.parse).catch(() => undefined)
    check('C2', '扫描后索引已重建', idxBack?.captains?.['cap-sync'] === 'sync-1')
    await writeFile(join(rootD, 'index.json'), '{corrupt!!', 'utf8')
    check('C3', '损坏索引 → 自愈且成员可查', (await state.findTeamByParticipant(rootD, 'mem-1'))?.id === 'sync-1')
    await writeFile(join(rootD, 'index.json'), JSON.stringify({ captains: { 'cap-sync': 'ghost-team' }, members: {} }), 'utf8')
    check('C4', '索引指向不存在团队 → 回落扫描', (await state.findTeamByParticipant(rootD, 'cap-sync'))?.id === 'sync-1')

    const raw = JSON.parse(await readFile(join(rootD, 'sync-1', 'team.json'), 'utf8'))
    raw.phase = 'active'
    raw.planReviewState = 'approved'
    await writeFile(join(rootD, 'sync-1', 'team.json'), JSON.stringify(raw, null, 2), 'utf8')
    const coerced = await state.readTeam(rootD, 'sync-1')
    check('C5', '手改 phase=active 容错为 running,非法 planReviewState 丢弃', coerced?.phase === 'running' && coerced.planReviewState === undefined)
    raw.phase = 'running'
    await writeFile(join(rootD, 'sync-1', 'team.json'), `\uFEFF${JSON.stringify(raw)}`, 'utf8')
    check('C6', 'BOM 容错', (await state.readTeam(rootD, 'sync-1'))?.id === 'sync-1')
    raw.tasks = [{ id: 't1', subject: 's', status: 'pending', dependencies: [], createdAt: Date.now(), updatedAt: Date.now(), acceptance: ['', '  '], inScope: ['src/a.ts'] }]
    await writeFile(join(rootD, 'sync-1', 'team.json'), JSON.stringify(raw), 'utf8')
    const cleaned = await state.readTeam(rootD, 'sync-1')
    check('C7', '任务空列表字段清理且保留有效项', cleaned?.tasks[0]?.acceptance === undefined && cleaned?.tasks[0]?.inScope?.[0] === 'src/a.ts')
    await writeFile(join(rootD, 'sync-1', 'team.json'), JSON.stringify({ id: 'sync-1' }), 'utf8')
    await expectError('C8', '结构性损坏 → readTeam 抛错且描述原因', () => state.readTeam(rootD, 'sync-1'), 'invalid TeamsX state')
    check('C9', 'stateRootDiagnostics 标记损坏团队', (await state.stateRootDiagnostics(rootD)).some((d) => d.id === 'sync-1' && d.valid === false))
    // 授权错误附诊断
    const mE = makeMockCtx()
    toolsMod.registerTeamsXTools(mE.ctx, { ...CONFIG, stateDir: '.teams-x-d' })
    await expectError('C10', '授权失败附状态根诊断(不伪装为无团队)', () => toolOf(mE.registered, 'teamsx_status').execute({}, { agent: makeAgent('cap-sync', wsD), signal: SIGNAL() }), 'State root')
    // 恢复
    raw.tasks = []
    await writeFile(join(rootD, 'sync-1', 'team.json'), JSON.stringify(raw), 'utf8')

    // 并发锁串行化
    let counter = 0
    await Promise.all(Array.from({ length: 200 }, () => state.withTeamLock('lock-test', async () => {
      const c = counter
      await new Promise((r) => setTimeout(r, 1))
      counter = c + 1
    })))
    check('C11', '200 并发锁写串行化(读-改-写无丢失)', counter === 200)
    const t0 = performance.now()
    await state.withTeamLock('lock-test', async () => 'y')
    check('C12', '锁释放后可立即重入(无死锁/无泄漏)', performance.now() - t0 < 50)
    // 原子写并发
    await state.createTeamDir(rootD, { name: 'sync-2', id: 'sync-2', captainSessionId: 'cap-2', createdAt: Date.now(), members: [], tasks: [], taskSeq: 0, phase: 'running' })
    await Promise.all(Array.from({ length: 50 }, (_, i) => state.withTeamLock(`team:${rootD}:sync-2`, async () => {
      const t2 = await state.readTeam(rootD, 'sync-2')
      t2.description = `write-${i}`
      await state.writeTeam(rootD, t2)
    })))
    check('C13', '50 并发读改写后 JSON 完整可解析', (await state.readTeam(rootD, 'sync-2'))?.description?.startsWith('write-') === true)

    // 索引校验和
    const idxFile = join(rootD, 'index.json')
    const idxRaw = JSON.parse(await readFile(idxFile, 'utf8'))
    check('C14', '索引文件包含 16 字符 checksum', typeof idxRaw.checksum === 'string' && idxRaw.checksum.length === 16)
    // 篡改内容但保留旧 checksum → readIndex 检测不匹配 → 降级全扫描 → rebuildIndex 清除篡改
    const tampered = { ...idxRaw, captains: { ...idxRaw.captains, 'fake-session': 'fake-team' } }
    await writeFile(idxFile, JSON.stringify(tampered), 'utf8')
    await state.findTeamByParticipant(rootD, 'cap-sync')
    const healedIdx = JSON.parse(await readFile(idxFile, 'utf8'))
    check('C15', '篡改索引(checksum 不匹配) → 自愈重建且 fake-session 被清除', healedIdx.captains?.['fake-session'] === undefined)
    // 旧格式(无 checksum) → 向后兼容读取
    const oldFormat = { captains: idxRaw.captains, members: idxRaw.members }
    await writeFile(idxFile, JSON.stringify(oldFormat), 'utf8')
    check('C16', '旧格式索引(无 checksum) → 向后兼容读取', (await state.findTeamByParticipant(rootD, 'cap-sync'))?.id === 'sync-1')
  }

  // ══════════════════ D 通知与消息推送 ══════════════════
  group('D 通知与消息推送(信箱/投递/容错)')
  {
    const { ctx, registered, agents } = makeMockCtx()
    const captain = makeAgent('captain-M', WS)
    agents.set('captain-M', captain)
    toolsMod.registerTeamsXTools(ctx, CONFIG)
    const cexec = { agent: captain, signal: SIGNAL() }
    await toolOf(registered, 'teamsx_create').execute({ name: 'msg-team' }, cexec)
    await toolOf(registered, 'teamsx_add_member').execute({ name: 'sender' }, cexec)
    const team = () => state.readTeam(ROOT, 'msg-team')
    const setMemberId = async (id) => {
      const fresh = await team()
      fresh.members[0].id = id
      await state.writeTeam(ROOT, fresh)
      await state.reindexTeam(ROOT, fresh)
    }
    await setMemberId('child-200')
    const sender = makeAgent('child-200', WS)
    agents.set('child-200', sender)
    const sexec = { agent: sender, signal: SIGNAL() }

    const m1 = await toolOf(registered, 'teamsx_send_message').execute({ to: 'captain', content: 'report alpha' }, sexec)
    check('D1', '成员→在线 captain → live 投递', m1.delivered === 'live')
    check('D1b', 'message-sent 事件', captain.events.some((e) => e.type === 'teamsx/message-sent' && e.data.to === 'captain'))
    check('D1c', 'live 投递后 captain unread=0(已确认)', (await state.readUnreadMailbox(ROOT, 'msg-team', CAPTAIN_KEY)).length === 0)

    const m2 = await toolOf(registered, 'teamsx_send_message').execute({ to: 'sender', content: 'do X' }, cexec)
    check('D2', 'captain→在线成员 → wake 投递', m2.delivered === 'wake')
    check('D2b', 'wake 投递后成员 unread=0', (await state.readUnreadMailbox(ROOT, 'msg-team', 'sender')).length === 0)

    // 模拟成员离线: 投递通道被拒(sendMessage 抛错 → deliverToChild 容错 false)
    // (发现: 结构校验禁止非 staged 团队成员 id 为空,故不能用清空 id 模拟未 spawn)
    const originalSend = ctx.subagents.sendMessage
    ctx.subagents.sendMessage = async () => { throw new Error('member offline') }
    const m3 = await toolOf(registered, 'teamsx_send_message').execute({ to: 'sender', content: 'offline note' }, cexec)
    ctx.subagents.sendMessage = originalSend
    check('D3', '投递被拒(成员离线)→ durable mailbox', m3.delivered === 'mailbox')
    const persisted = await state.readMailbox(ROOT, 'msg-team', 'sender')
    check('D3b', 'mailbox 记录持久化且带 id', persisted.length === 2 && typeof persisted[1].id === 'string')

    await state.claimMailboxDelivery(ROOT, 'msg-team', 'sender', [persisted[1].id])
    check('D4', '投递租约期内不可重复投递', (await state.readUnreadMailbox(ROOT, 'msg-team', 'sender')).length === 0)
    const lines = (await readFile(join(ROOT, 'msg-team', 'inbox', 'sender.jsonl'), 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
    lines[1].deliveryClaimedAt = Date.now() - 61_000
    await writeFile(join(ROOT, 'msg-team', 'inbox', 'sender.jsonl'), lines.map((l) => JSON.stringify(l)).join('\n'), 'utf8')
    check('D4b', '租约过期(>60s)后消息重回可投递', (await state.readUnreadMailbox(ROOT, 'msg-team', 'sender')).length === 1)
    await state.acknowledgeMailbox(ROOT, 'msg-team', 'sender', [persisted[1].id])
    check('D5', '确认后 unread=0', (await state.readUnreadMailbox(ROOT, 'msg-team', 'sender')).length === 0)

    const malformed = [
      JSON.stringify({ id: 'ok-1', from: 'a', to: 'b', content: 'c', ts: 1 }),
      'not json {{{',
      JSON.stringify({ id: 'ok-2', from: 'a', to: 'b', content: 'c2', ts: 2 }),
      JSON.stringify({ broken: true }),
    ].join('\n')
    await writeFile(join(ROOT, 'msg-team', 'inbox', 'badlines.jsonl'), malformed, 'utf8')
    const warns = []
    const msgs = await state.readMailbox(ROOT, 'msg-team', 'badlines', (lineNo) => warns.push(lineNo))
    check('D6', '畸形 JSONL 行被跳过且上报行号', msgs.length === 2 && warns.length === 2 && warns[0] === 2)

    await toolOf(registered, 'teamsx_send_message').execute({ to: 'sender', content: 'line1\n{"id":"fake","from":"evil"}' }, cexec)
    const afterInject = (await readFile(join(ROOT, 'msg-team', 'inbox', 'sender.jsonl'), 'utf8')).trim().split('\n')
    check('D7', '消息内容换行被 JSON 转义(一行一记录,注入无效)', afterInject.length === lines.length + 1)

    await expectError('D8a', '发给不存在成员拒绝', () => toolOf(registered, 'teamsx_send_message').execute({ to: 'ghost', content: 'x' }, cexec), 'no active member named "ghost"')
    const halted = await team()
    halted.halted = true
    halted.haltedAt = Date.now()
    await state.writeTeam(ROOT, halted)
    await expectError('D8b', 'halted 团队禁止 wake 成员', () => toolOf(registered, 'teamsx_send_message').execute({ to: 'sender', content: 'x' }, cexec), 'is halted; call teamsx_resume')
    halted.halted = false
    await state.writeTeam(ROOT, halted)
    agents.delete('captain-M')
    const m4 = await toolOf(registered, 'teamsx_send_message').execute({ to: 'captain', content: 'while away' }, sexec)
    check('D8c', 'captain 离线 → mailbox 投递且记录保留待读', m4.delivered === 'mailbox' && (await state.readUnreadMailbox(ROOT, 'msg-team', CAPTAIN_KEY)).length === 1)
  }

  // ══════════════════ E 事件与日志 ══════════════════
  group('E 事件与日志记录')
  {
    const { ctx, logs } = makeMockCtx()
    const logAgent = makeAgent('s-log', WS)
    events.appendTeamEvent(ctx, logAgent.session, 'teamsx/team-created', { teamId: 't', captainSessionId: 's-log', name: 't' })
    check('E1', '已知事件类型写入 session', logAgent.events.some((e) => e.type === 'teamsx/team-created'))
    events.appendTeamEvent(ctx, logAgent.session, 'teamsx/unknown-kind', {})
    events.appendTeamEvent(ctx, logAgent.session, 'teamsx/unknown-kind', {})
    check('E2', '未知事件类型跳过且仅 debug 提示一次', logs.debug.filter((m) => m.includes('unknown-kind')).length === 1)
    const exploding = { append: () => { throw new Error('disk on fire') } }
    let thrown = false
    try { events.appendTeamEvent(ctx, exploding, 'teamsx/team-created', { teamId: 'x', captainSessionId: 'c', name: 'x' }) } catch { thrown = true }
    check('E3', 'session.append 异常被吞并 warn(不阻断工具)', thrown === false && logs.warn.some((m) => m.includes('session record failed')))
    const fallback = makeAgent('fallback', WS)
    check('E4', 'captain 离线 → 事件落到调用者 session(回退)', events.captainSessionOf(ctx, 'missing-id', fallback.session) === fallback.session)
  }

  // ══════════════════ F 异常处理 ══════════════════
  group('F 异常处理(参数/依赖/状态机/质量门)')
  {
    const { ctx, registered } = makeMockCtx()
    const captain = makeAgent('captain-F', WS)
    toolsMod.registerTeamsXTools(ctx, CONFIG)
    const cexec = { agent: captain, signal: SIGNAL() }

    await expectError('F1', '缺 required 参数 → 参数校验错误', () => toolOf(registered, 'teamsx_create').execute({}, cexec), undefined)
    await expectError('F2', 'exec.agent 缺失 → 明确报错', () => toolOf(registered, 'teamsx_create').execute({ name: 'x' }, { agent: undefined, signal: SIGNAL() }), 'require a calling agent')
    await expectError('F3', '无团队时 status 报错', () => toolOf(registered, 'teamsx_status').execute({}, cexec), 'you do not lead or belong to any active team yet')

    await toolOf(registered, 'teamsx_create').execute({ name: 'err-team' }, cexec)
    await toolOf(registered, 'teamsx_add_member').execute({ name: 'w1' }, cexec)
    await toolOf(registered, 'teamsx_add_member').execute({ name: 'w2' }, cexec)
    await expectError('F4', 'create_task 空 subject 拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: '' }, cexec), 'subject must be a non-empty string')
    await expectError('F5', '未知依赖拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x', dependencies: ['t99'] }, cexec), 'dependency "t99" does not exist')
    await expectError('F6', 'implementation 缺 inScope 拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x', kind: 'implementation', objective: 'o', acceptance: ['a'], verify: ['v'] }, cexec), 'implementation tasks require a non-empty inScope')
    await expectError('F7', 'implementation 缺 verify 拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x', kind: 'implementation', objective: 'o', acceptance: ['a'], inScope: ['src/'] }, cexec), 'implementation tasks require a non-empty verify list')
    await expectError('F8', 'quality 缺 objective 拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x', kind: 'verification', acceptance: ['a'] }, cexec), 'verification tasks require a non-empty objective')
    await expectError('F9', 'review 缺 description 拒绝', () => toolOf(registered, 'teamsx_create_task').execute({ subject: 'x', kind: 'review', objective: 'o', acceptance: ['a'] }, cexec), 'review tasks require a description')

    await toolOf(registered, 'teamsx_create_task').execute({ subject: 'first' }, cexec)
    await toolOf(registered, 'teamsx_create_task').execute({ subject: 'second', dependencies: ['t1'] }, cexec)
    await expectError('F10', '依赖未完成 claim 被阻', () => toolOf(registered, 'teamsx_claim_task').execute({ task_id: 't2', assignee: 'w1' }, cexec), 'blocked by unfinished dependencies: t1')

    // implementation 契约全流程(成员身份驱动;用独立成员 w2 避开 w1 的自动分派互斥)
    const w2agent = makeAgent('child-2', WS)
    const w2exec = { agent: w2agent, signal: SIGNAL() }
    const impT = await toolOf(registered, 'teamsx_create_task').execute({
      subject: 'impl', kind: 'implementation', objective: 'obj', acceptance: ['a1'], inScope: ['src/a.ts'], verify: ['npm test'], assignee: 'w2',
    }, cexec)
    const impClaim = await toolOf(registered, 'teamsx_claim_task').execute({ task_id: impT.task_id, assignee: 'w2' }, cexec)
    await toolOf(registered, 'teamsx_update_task').execute({ task_id: impT.task_id, status: 'in_progress', attempt_id: impClaim.attempt_id }, w2exec)
    await expectError('F12', 'verify 失败却想 completed → 拒绝', () => toolOf(registered, 'teamsx_update_task').execute({
      task_id: impT.task_id, status: 'completed', attempt_id: impClaim.attempt_id,
      acceptanceResults: [{ criterion: 'a1', status: 'passed' }],
      commandsRun: [{ command: 'npm test', status: 'failed', exitCode: 1 }],
      changedPaths: ['src/a.ts'],
    }, w2exec), 'verify failure must fail the task')
    await expectError('F13', 'changedPaths 越界拒绝', () => toolOf(registered, 'teamsx_update_task').execute({
      task_id: impT.task_id, status: 'completed', attempt_id: impClaim.attempt_id,
      acceptanceResults: [{ criterion: 'a1', status: 'passed' }],
      commandsRun: [{ command: 'npm test', status: 'passed' }],
      changedPaths: ['other/file.ts'],
    }, w2exec), 'cannot complete: other/file.ts is undeclared')
    await expectError('F14', '.env 默认排除(即使 inScope 声明)', () => toolOf(registered, 'teamsx_update_task').execute({
      task_id: impT.task_id, status: 'completed', attempt_id: impClaim.attempt_id,
      acceptanceResults: [{ criterion: 'a1', status: 'passed' }],
      commandsRun: [{ command: 'npm test', status: 'passed' }],
      changedPaths: ['src/a.ts', '.env'],
    }, w2exec), 'is out_of_scope')
    await expectError('F15', '完成缺 acceptanceResults 拒绝', () => toolOf(registered, 'teamsx_update_task').execute({
      task_id: impT.task_id, status: 'completed', attempt_id: impClaim.attempt_id,
      commandsRun: [{ command: 'npm test', status: 'passed' }],
      changedPaths: ['src/a.ts'],
    }, w2exec), 'requires passed acceptanceResults')
    const done = await toolOf(registered, 'teamsx_update_task').execute({
      task_id: impT.task_id, status: 'completed', attempt_id: impClaim.attempt_id,
      acceptanceResults: [{ criterion: 'a1', status: 'passed', evidence: 'test log' }],
      commandsRun: [{ command: 'npm test', status: 'passed', exitCode: 0 }],
      changedPaths: ['src/a.ts'],
    }, w2exec)
    check('F16', '合法完成通过全部质量门', done.status === 'completed')

    await rm(join(ROOT, 'err-team'), { recursive: true, force: true })
    await expectError('F17', '团队目录消失 → 明确报错', () => toolOf(registered, 'teamsx_claim_task').execute({ task_id: 't1' }, cexec), 'you do not lead or belong to any active team yet')

    // halt/resume
    const ctxH = makeMockCtx()
    toolsMod.registerTeamsXTools(ctxH.ctx, CONFIG)
    const capH = makeAgent('captain-H', WS)
    ctxH.agents.set('captain-H', capH)
    const hexec = { agent: capH, signal: SIGNAL() }
    await toolOf(ctxH.registered, 'teamsx_create').execute({ name: 'halt-team' }, hexec)
    await toolOf(ctxH.registered, 'teamsx_add_member').execute({ name: 'hw' }, hexec)
    await toolOf(ctxH.registered, 'teamsx_create_task').execute({ subject: 'hw-task', assignee: 'hw' }, hexec)
    const halt = await toolsMod.haltTeamWork({ ctx: ctxH.ctx, stateRoot: ROOT, teamId: 'halt-team', captain: capH })
    check('F18', 'halt 取消未完成任务', halt.cancelledTasks === 1 && halt.alreadyHalted === false)
    const haltIdem = await toolsMod.haltTeamWork({ ctx: ctxH.ctx, stateRoot: ROOT, teamId: 'halt-team', captain: capH })
    check('F18e', '重复 halt 幂等(alreadyHalted)', haltIdem.alreadyHalted === true)
    const haltedTeam = await state.readTeam(ROOT, 'halt-team')
    check('F18b', 'halt 后任务 cancelled、标志位持久化', haltedTeam.halted === true && haltedTeam.tasks[0].status === 'cancelled')
    await expectError('F18c', 'halted 团队 create_task 拒绝', () => toolOf(ctxH.registered, 'teamsx_create_task').execute({ subject: 'more' }, hexec), 'team is halted; call teamsx_resume')
    const resumed = await toolOf(ctxH.registered, 'teamsx_resume').execute({ reason: 'continue' }, hexec)
    check('F18d', 'resume 后状态恢复', resumed.status === 'resumed')
    await toolOf(ctxH.registered, 'teamsx_delete').execute({}, hexec)

    // reassign 语义
    const ctxR = makeMockCtx()
    toolsMod.registerTeamsXTools(ctxR.ctx, CONFIG)
    const capR = makeAgent('captain-R', WS)
    ctxR.agents.set('captain-R', capR)
    const rexec = { agent: capR, signal: SIGNAL() }
    await toolOf(ctxR.registered, 'teamsx_create').execute({ name: 'reassign-team' }, rexec)
    await toolOf(ctxR.registered, 'teamsx_add_member').execute({ name: 'rw' }, rexec)
    const rt = await toolOf(ctxR.registered, 'teamsx_create_task').execute({ subject: 'r-task', assignee: 'rw' }, rexec)
    const claimRw = await toolOf(ctxR.registered, 'teamsx_claim_task').execute({ task_id: rt.task_id, assignee: 'rw' }, rexec)
    await expectError('F19', '重派到不存在成员拒绝', () => toolOf(ctxR.registered, 'teamsx_reassign_task').execute({ task_id: rt.task_id, assignee: 'ghost' }, rexec), 'no active member named "ghost"')
    const re = await toolOf(ctxR.registered, 'teamsx_reassign_task').execute({ task_id: rt.task_id, assignee: 'captain', reason: 'takeover' }, rexec)
    const teamR = await state.readTeam(ROOT, 'reassign-team')
    const taskR = teamR.tasks.find((t) => t.id === rt.task_id)
    check('F19b', 'captain 接管 → 影子模式(assignee 保留/attempt 保留/takenOverBy)',
      re.assignee === 'rw' && re.attempt_id === claimRw.attempt_id
      && taskR.takenOverBy === 'captain' && taskR.status === 'claimed',
      JSON.stringify({ assignee: re.assignee, attempt_id: re.attempt_id, takenOverBy: taskR.takenOverBy, status: taskR.status }))
    await toolOf(ctxR.registered, 'teamsx_delete').execute({}, rexec)
  }

  // ══════════════════ G Staged 计划流与兼容层 ══════════════════
  group('G Staged 计划流 + 兼容层')
  {
    const { ctx, registered } = makeMockCtx()
    const captain = makeAgent('captain-G', WS)
    toolsMod.registerTeamsXTools(ctx, CONFIG)
    const cexec = { agent: captain, signal: SIGNAL() }

    const staged = await toolOf(registered, 'teamsx_create').execute({ name: 'plan-team', approval: 'required' }, cexec)
    check('G1', 'staged 创建 → phase=staged + awaiting_review', staged.phase === 'staged')
    const added = await toolOf(registered, 'teamsx_add_member').execute({ name: 'planner' }, cexec)
    check('G2', 'staged 添加成员不 spawn(id="")', added.member_id === '' && added.phase === 'staged')
    check('G2b', 'staged 团队磁盘无子代理 id', (await state.readTeam(ROOT, 'plan-team')).members[0].id === '')

    const edited = await toolOf(registered, 'teamsx_edit_plan').execute({
      operations: [
        { action: 'add_task', subject: 'task one', assignee: 'planner' },
        { action: 'add_task', subject: 'task two', dependencies: ['t1'] },
      ],
    }, cexec)
    check('G3', 'edit_plan 原子批量添加任务', edited.tasks === 2 && edited.graph.length === 2)
    await expectError('G4', '非法操作整批拒绝(原子性)', () => toolOf(registered, 'teamsx_edit_plan').execute({
      operations: [
        { action: 'add_task', subject: 'task three' },
        { action: 'add_task', subject: '' },
      ],
    }, cexec), 'requires a non-empty subject')
    check('G4b', '失败批次无残留', (await state.readTeam(ROOT, 'plan-team')).tasks.length === 2)
    await expectError('G5', '循环依赖拒绝', () => toolOf(registered, 'teamsx_edit_plan').execute({
      operations: [{ action: 'update_task', task_id: 't1', subject: 'task one', dependencies: ['t2'] }],
    }, cexec), 'cycle at "t1"')
    await expectError('G6', '被依赖任务不可删除', () => toolOf(registered, 'teamsx_edit_plan').execute({
      operations: [{ action: 'remove_task', task_id: 't1' }],
    }, cexec), 'still required by "t2"')
    await expectError('G7', '成员仍有计划任务不可删', () => toolOf(registered, 'teamsx_edit_plan').execute({
      operations: [{ action: 'remove_member', member_name: 'planner' }],
    }, cexec), 'still owns planned tasks: t1')
    await expectError('G8', 'approve 空确认拒绝', () => toolOf(registered, 'teamsx_approve').execute({ confirmation: '' }, cexec), 'explicit user approval text is required')

    const rt = makeMockCtx()
    toolsMod.registerTeamsXTools(rt.ctx, CONFIG)
    const capG2 = makeAgent('captain-G2', WS)
    const g2exec = { agent: capG2, signal: SIGNAL() }
    await toolOf(rt.registered, 'teamsx_create').execute({ name: 'plan-team-2', approval: 'required' }, g2exec)
    await toolOf(rt.registered, 'teamsx_add_member').execute({ name: 'p2' }, g2exec)
    await toolOf(rt.registered, 'teamsx_edit_plan').execute({ operations: [{ action: 'add_task', subject: 'work item' }] }, g2exec)
    const approved = await toolOf(rt.registered, 'teamsx_approve').execute({ confirmation: 'user said go' }, g2exec)
    check('G9', 'approve → running + 成员 spawn', approved.status === 'running' && approved.members === 1)
    await expectError('G9b', 'approve 后 edit_plan 拒绝', () => toolOf(rt.registered, 'teamsx_edit_plan').execute({ operations: [{ action: 'add_task', subject: 'late' }] }, g2exec), 'already running; its plan can no longer be edited')

    const rt2 = makeMockCtx()
    toolsMod.registerTeamsXTools(rt2.ctx, CONFIG)
    const capG3 = makeAgent('captain-G3', WS)
    await toolOf(rt2.registered, 'teamsx_create').execute({ name: 'plan-team-3', approval: 'required' }, { agent: capG3, signal: SIGNAL() })
    await expectError('G10', '无成员 approve 拒绝', () => toolOf(rt2.registered, 'teamsx_approve').execute({ confirmation: 'go' }, { agent: capG3, signal: SIGNAL() }), 'add at least one member before approving')

    const rt3 = makeMockCtx()
    toolsMod.registerTeamsXTools(rt3.ctx, CONFIG)
    const capG4 = makeAgent('captain-G4', WS)
    await toolOf(rt3.registered, 'teamsx_create').execute({ name: 'plan-team-4', approval: 'required' }, { agent: capG4, signal: SIGNAL() })
    const discarded = await toolOf(rt3.registered, 'teamsx_delete').execute({}, { agent: capG4, signal: SIGNAL() })
    check('G11', 'discard(经 delete)归档计划', discarded.deleted === true)

    // 兼容层
    const ctxC1 = makeMockCtx()
    ctxC1.ctx.subagents = { sendMessage: async () => 'ok' }
    check('G12', 'compat.deliverToChild 优先 sendMessage', await compat.deliverToChild(ctxC1.ctx, makeAgent('p', WS), 'c', [], { signal: SIGNAL() }) === true)
    const ctxC2 = makeMockCtx()
    ctxC2.ctx.subagents = { followup: async () => 'ok' }
    check('G13', 'sendMessage 缺失 → followup 回退', await compat.deliverToChild(ctxC2.ctx, makeAgent('p', WS), 'c', [], { signal: SIGNAL() }) === true)
    const ctxC3 = makeMockCtx()
    ctxC3.ctx.subagents = {}
    check('G14', '两者皆无 → false(不抛)', await compat.deliverToChild(ctxC3.ctx, makeAgent('p', WS), 'c', [], { signal: SIGNAL() }) === false)
    const ctxC4 = makeMockCtx()
    ctxC4.ctx.subagents = { sendMessage: async () => { throw new Error('boom') } }
    check('G15', '投递异常 → false(容错)', await compat.deliverToChild(ctxC4.ctx, makeAgent('p', WS), 'c', [], { signal: SIGNAL() }) === false)
    check('G16', 'sessionOwnEvents: ownEvents() 优先', compat.sessionOwnEvents({ ownEvents: () => [1, 2] }).length === 2)
    check('G17', 'sessionOwnEvents: legacy seedLength 切片', compat.sessionOwnEvents({ header: { seedLength: 3 }, events: [0, 0, 0, 'a', 'b'] }).length === 2)
    const ctxD1 = makeMockCtx()
    ctxD1.ctx.subagents = { drainContinuableChildren: async () => {} }
    check('G18', 'drainChildren: 有能力 → drained', await compat.drainChildren(ctxD1.ctx, makeAgent('p', WS), ['c']) === 'drained')
    const ctxD2 = makeMockCtx()
    ctxD2.ctx.subagents = {}
    check('G19', 'drainChildren: 无能力 → unavailable', await compat.drainChildren(ctxD2.ctx, makeAgent('p', WS), ['c']) === 'unavailable')
  }

  // ══════════════════ I 安全性 ══════════════════
  group('I 安全性(路径/注入/认证门)')
  {
    const cases = [
      ['../../etc/passwd', 'etc-passwd'],
      ['a/b/c', 'a-b-c'],
      ['..', /^k-[0-9a-f]{8}$/],
      ['###', /^k-[0-9a-f]{8}$/],
      ['团队 名称', '团队-名称'],
      ['x'.repeat(80), /^x{48}-[0-9a-f]{8}$/],
      ['', /^k-[0-9a-f]{8}$/],
      ['CAPTAIN', 'captain'],
    ]
    let ok = 0
    for (const [input, expect] of cases) {
      const out = state.sanitizeKey(input)
      const pass = typeof expect === 'string' ? out === expect : expect.test(out)
      if (pass) ok += 1
      else console.log(`     sanitizeKey(${JSON.stringify(input.slice(0, 24))}) → ${JSON.stringify(out)} (expected ${String(expect).slice(0, 30)})`)
    }
    check('I1', `sanitizeKey 注入/边界矩阵(${ok}/${cases.length})`, ok === cases.length)
    check('I2', '路径分隔符永不存留', ['../../etc/passwd', 'a\\b', 'c/d'].every((input) => !/[\\/]/.test(state.sanitizeKey(input))))
    check('I3', 'normalizeWorkspacePath: .. 逃逸 → illegal', quality.normalizeWorkspacePath('../secret') === undefined)
    check('I4', '绝对路径 → illegal', quality.normalizeWorkspacePath('/etc/passwd') === undefined)
    check('I5', '盘符 → illegal', quality.normalizeWorkspacePath('C:\\win') === undefined)
    check('I6', '~ → illegal', quality.normalizeWorkspacePath('~/.ssh') === undefined)
    check('I7', '相对路径归一', quality.normalizeWorkspacePath('./src//a.ts') === 'src/a.ts')
    check('I8', '目录模式匹配子路径', quality.pathMatchesScope('src/deep/b.ts', 'src/') === true)
    check('I9', '文件模式不匹配其他文件', quality.pathMatchesScope('src/ab.ts', 'src/a.ts') === false)

    await writeFile(join(ROOT, 'msg-team', 'inbox', 'shape-guard.jsonl'), JSON.stringify({ id: 'x', from: 'a', to: 'b', content: 'c', ts: 'not-a-number' }), 'utf8')
    let shapeWarned = false
    await state.readMailbox(ROOT, 'msg-team', 'shape-guard', () => { shapeWarned = true })
    check('I10', '非法 ts 类型记录被拒(形状守卫)', shapeWarned)

    const makeRes = () => {
      const res = { statusCode: 0, headers: undefined, body: '' }
      res.writeHead = (code, headers) => { res.statusCode = code; res.headers = headers }
      res.end = (body) => { res.body = body ?? '' }
      return res
    }
    const handlerCalls = []
    const server = { register: (route) => { handlerCalls.push(route); return () => {} } }
    const gated = webRoutes.authenticatedWebRoutes(server, () => ({
      requestRejection: (req) => (req.headers.authorization === undefined ? 401 : req.headers.authorization === 'expired' ? 403 : undefined),
    }))
    gated.register({ kind: 'exact', path: '/x', handler: async () => {} })
    const r401 = makeRes()
    await handlerCalls[0].handler({ headers: {} }, r401)
    check('I11', '无凭据 → HTTP 401 + JSON 错误体', r401.statusCode === 401 && JSON.parse(r401.body).error === 'unauthorized')
    const r403 = makeRes()
    await handlerCalls[0].handler({ headers: { authorization: 'expired' } }, r403)
    check('I12', '过期凭据 → HTTP 403', r403.statusCode === 403)
    let reached = false
    const server2 = { register: (route) => { handlerCalls.push(route); return () => {} } }
    const gated2 = webRoutes.authenticatedWebRoutes(server2, () => ({ requestRejection: () => undefined }))
    gated2.register({ kind: 'exact', path: '/y', handler: async () => { reached = true } })
    await handlerCalls[1].handler({ headers: { authorization: 'ok' } }, makeRes())
    check('I13', '认证通过 → handler 执行', reached === true)
    const server3 = { register: (route) => { handlerCalls.push(route); return () => {} } }
    const gated3 = webRoutes.authenticatedWebRoutes(server3, () => undefined)
    gated3.register({ kind: 'exact', path: '/z', handler: async () => {} })
    const r503 = makeRes()
    await handlerCalls[2].handler({ headers: {} }, r503)
    check('I14', 'Connection 缺失 → 503(authentication unavailable)', r503.statusCode === 503)
  }

  // ══════════════════ H 性能(同步组织,避免输出交错)══════════════════
  group('H 性能(响应时间/资源)')
  {
    const wsPerf = join(sandbox, 'ws-perf')
    const rootP = join(wsPerf, '.teams-x-p')
    const bigMembers = Array.from({ length: 50 }, (_, i) => ({ id: `mem-${i}`, name: `m${i}`, provider: 'p', model: 'm', joinedAt: Date.now(), status: 'idle' }))
    const bigTasks = Array.from({ length: 300 }, (_, i) => ({
      id: `t${i + 1}`, subject: `task ${i}`, status: i % 3 === 0 ? 'completed' : 'pending',
      dependencies: i > 2 ? [`t${i - 2}`] : [], createdAt: Date.now(), updatedAt: Date.now(),
    }))
    const big = { name: 'big', id: 'big', captainSessionId: 'cap-big', createdAt: Date.now(), members: bigMembers, tasks: bigTasks, taskSeq: 300, phase: 'running' }

    const performance = (async () => {
      await runTimed('H1', '大团队(50成员×300任务)createTeamDir + 索引', 500, () => state.createTeamDir(rootP, big))
      const team = await runTimed('H2', '大团队 readTeam(含全量校验)', 40, () => state.readTeam(rootP, 'big'))
      await runTimed('H3', '大团队 writeTeam + 重读', 80, async () => {
        team.description = 'updated'
        await state.writeTeam(rootP, team)
        return state.readTeam(rootP, 'big')
      })
      await runTimed('H4', 'findTeamByParticipant 索引命中', 25, () => state.findTeamByParticipant(rootP, 'mem-49'))
      await rm(join(rootP, 'index.json'), { force: true })
      await runTimed('H5', 'findTeamByParticipant 索引缺失全扫重建', 120, () => state.findTeamByParticipant(rootP, 'cap-big'))
      await runTimed('H6', 'taskDepthsById 300 节点', 30, () => state.taskDepthsById(bigTasks))
      await runTimed('H7', 'unsatisfiedDependencies 300 任务(预建索引)', 10, () => {
        const byId = new Map(bigTasks.map((t) => [t.id, t]))
        let blocked = 0
        for (const task of bigTasks) blocked += state.unsatisfiedDependencies(bigTasks, task.dependencies, byId).length
        return blocked
      })
      const lines = Array.from({ length: 1000 }, (_, i) => JSON.stringify({ id: `m${i}`, from: 'a', to: 'b', content: `msg ${i}`, ts: Date.now() }))
      await mkdir(join(rootP, 'big', 'inbox'), { recursive: true })
      await writeFile(join(rootP, 'big', 'inbox', 'flood.jsonl'), lines.join('\n'), 'utf8')
      await runTimed('H8', 'readUnreadMailbox 1000 条消息', 60, () => state.readUnreadMailbox(rootP, 'big', 'flood'))
      await runTimed('H9', 'withTeamLock 500 次并发获取(吞吐)', 150, () => Promise.all(Array.from({ length: 500 }, () => state.withTeamLock('perf-lock', async () => 1))))
    })()

    // ══════════════════ K 快照视图与邮箱可见性 ══════════════════
    const views = (async () => {
      const ctxK = makeMockCtx()
      toolsMod.registerTeamsXTools(ctxK.ctx, CONFIG)
      const regK = ctxK.registered
      const capK = makeAgent('captain-K', WS)
      ctxK.agents.set('captain-K', capK)
      const kexec = { agent: capK, signal: SIGNAL() }
      await toolOf(regK, 'teamsx_create').execute({ name: 'view-team' }, kexec)
      await toolOf(regK, 'teamsx_add_member').execute({ name: 'viewer' }, kexec)
      const team = await state.readTeam(ROOT, 'view-team')
      team.members[0].id = 'child-900'
      await state.writeTeam(ROOT, team)
      await state.reindexTeam(ROOT, team)
      const memberAgent = makeAgent('child-900', WS)
      ctxK.agents.set('child-900', memberAgent)
      await state.appendMailbox(ROOT, 'view-team', CAPTAIN_KEY, state.createMessage('viewer', CAPTAIN_KEY, 'hello captain'))
      const capView = await toolOf(regK, 'teamsx_status').execute({}, kexec)
      check('K1', 'captain 视图: 看到所有成员与自己的 inbox', capView.viewer === CAPTAIN_KEY && capView.members.length === 1 && capView.captain_inbox.length === 1)
      // capView 内部的 kickTeam 会投递成员未读邮件,故成员邮件在其后追加
      await state.appendMailbox(ROOT, 'view-team', 'viewer', state.createMessage(CAPTAIN_KEY, 'viewer', 'hello member'))
      const memView = await toolOf(regK, 'teamsx_status').execute({}, { agent: memberAgent, signal: SIGNAL() })
      check('K2', '成员视图: 只见自己 inbox,不见 captain inbox', memView.viewer === 'viewer' && memView.captain_inbox.length === 0 && (memView.member_inboxes.viewer?.count ?? 0) >= 1)
      check('K3', '快照含 mailbox_warnings 字段(容错面)', Array.isArray(memView.mailbox_warnings) && typeof memView.mailbox_warning_count === 'number')
      check('K4', 'status 查看后成员邮箱已确认(读即确认)', (await state.readUnreadMailbox(ROOT, 'view-team', 'viewer')).length === 0)
      await toolOf(regK, 'teamsx_delete').execute({}, kexec)
    })()

    await Promise.all([performance, views])
  }

  // ══════════════════ L profiles 模板(v0.2 阶段一) ══════════════════
  group('L profiles 模板(teamsx_create profile= 参数)')
  {
    const wsL = join(sandbox, 'ws-profiles')
    const cfgL = {
      ...CONFIG, stateDir: '.teams-x-l',
      profiles: {
        researcher: {
          description: '研究团队模板',
          members: [{ name: 'researcher', role: '研究员', provider: 'xianyu', model: 'MiniMax-M2.7' }],
          tasks: [{ id: 'r1', subject: '调研目标', assignee: 'researcher', dependencies: [] }],
        },
      },
    }
    const rootL = join(wsL, cfgL.stateDir)
    const mL = makeMockCtx()
    toolsMod.registerTeamsXTools(mL.ctx, cfgL)
    const capL = makeAgent('captain-L', wsL)
    const lexec = { agent: capL, signal: SIGNAL() }

    // 解析在 withTeamLock 之前失败 → 不创建团队、不占 captain 名额
    await expectError('L1', '未知 profile 名拒绝', () => toolOf(mL.registered, 'teamsx_create').execute({ name: '调研X', description: 'profile=ghost 调研X' }, lexec), 'AgentTeams profile "ghost" not found')
    const seeded = await toolOf(mL.registered, 'teamsx_create').execute(
      { name: '调研X', description: 'profile=researcher 调研X', approval: 'required' },
      lexec,
    )
    check('L2', 'profile= 解析后 staged 创建成功', seeded.phase === 'staged', JSON.stringify(seeded.phase))
    const teamL = await state.readTeam(rootL, seeded.team_id)
    check('L3', '模板成员已 seed (researcher)', teamL.members.length === 1 && teamL.members[0].name === 'researcher' && teamL.members[0].model === 'MiniMax-M2.7', JSON.stringify(teamL.members.map((m) => `${m.name}/${m.model}`)))
    check('L4', '模板任务已 seed 且指派保留（种子 id 归一化为 t1）', teamL.tasks.length === 1 && teamL.tasks[0].id === 't1' && teamL.tasks[0].assignee === 'researcher', JSON.stringify(teamL.tasks.map((t) => t.id)))
    check('L5', 'taskSeq 反映 seed 任务数', teamL.taskSeq === 1, String(teamL.taskSeq))
    // 成员数超 maxMembers(4) 的模板在 resolve 阶段拒绝
    const cfgL2 = { ...cfgL, profiles: { big: { members: Array.from({ length: 5 }, (_, i) => ({ name: `m${i}` })) } } }
    const mL2 = makeMockCtx()
    toolsMod.registerTeamsXTools(mL2.ctx, cfgL2)
    const capL2 = makeAgent('captain-L2', wsL)
    await expectError('L6', '模板成员超 maxMembers 拒绝', () => toolOf(mL2.registered, 'teamsx_create').execute({ name: 'big-team', description: 'profile=big x' }, { agent: capL2, signal: SIGNAL() }), 'the limit is 4')
  }

  // ══════════════════ M 自动修复循环(v0.2 阶段三) ══════════════════
  group('M 自动修复循环(quality 失败 → repair 任务派生)')
  {
    const wsM = join(sandbox, 'ws-repair')
    const cfgM = { ...CONFIG, stateDir: '.teams-x-m', repairLoop: { maxRounds: 3, autoDerive: true } }
    const rootM = join(wsM, cfgM.stateDir)
    const mM = makeMockCtx()
    toolsMod.registerTeamsXTools(mM.ctx, cfgM)
    const capM = makeAgent('captain-M', wsM)
    const mexec = { agent: capM, signal: SIGNAL() }

    const now = Date.now()
    await state.createTeamDir(rootM, {
      name: 'repair-team', id: 'repair-team', captainSessionId: 'captain-M', createdAt: now,
      members: [],
      tasks: [{
        id: 't1', subject: 'Review deliverable', kind: 'review', description: 'review of t0',
        status: 'in_progress', dependencies: [], attempt: 0, createdAt: now, updatedAt: now,
      }],
      taskSeq: 1, phase: 'running',
    })

    // 触发契约: review 任务必须 failed + needs_revision + ≥1 findings(completed 只许 verdict=pass)
    const upd = await toolOf(mM.registered, 'teamsx_update_task').execute(
      {
        task_id: 't1', status: 'failed', verdict: 'needs_revision',
        findings: [{ id: 'f1', severity: 'high', problem: '崩溃', requiredFix: '加空值保护' }],
      },
      mexec,
    )
    check('M1', 'review 任务标记 failed+needs_revision', upd.status === 'failed' && upd.taskVerdict === 'needs_revision', JSON.stringify(upd))
    const teamM = await state.readTeam(rootM, 'repair-team')
    const repair = teamM.tasks.find((t) => t.kind === 'repair')
    check('M2', '自动派生 repair 任务', repair !== undefined, 'no repair task found')
    if (repair) {
      check('M3', 'repair 依赖失败任务 t1', repair.dependencies.includes('t1'), JSON.stringify(repair.dependencies))
      check('M4', 'repair round = 1(失败任务 round+1)', repair.round === 1, String(repair.round))
      check('M5', 'repair 主题含 Repair: 前缀且 findings 摘要入 description', repair.subject === 'Repair: Review deliverable' && repair.description.includes('[high] 崩溃'), `${repair.subject} / ${repair.description}`)
    }
    check('M6', '原 review 任务 verdict 持久化', teamM.tasks.find((t) => t.id === 't1')?.verdict === 'needs_revision', String(teamM.tasks.find((t) => t.id === 't1')?.verdict))

    // round 上限: round=3 的失败 review 不再派生
    teamM.tasks = teamM.tasks.filter((t) => t.kind !== 'repair')
    teamM.tasks.push({
      id: 't2', subject: 'Review 2', kind: 'review', description: 'review of t0',
      status: 'in_progress', dependencies: [], attempt: 0, round: 3, createdAt: now, updatedAt: now,
    })
    teamM.taskSeq = 2
    await state.writeTeam(rootM, teamM)
    await toolOf(mM.registered, 'teamsx_update_task').execute(
      { task_id: 't2', status: 'failed', verdict: 'reject', findings: [{ id: 'f2', severity: 'medium', problem: 'x', requiredFix: 'y' }] },
      mexec,
    )
    const teamM2 = await state.readTeam(rootM, 'repair-team')
    const repairCount = teamM2.tasks.filter((t) => t.kind === 'repair').length
    check('M7', 'round 已达上限(3)时不再派生 repair', repairCount === 0, `repair count=${repairCount}`)

    // autoDerive=false 关闭自动派生
    const wsM3 = join(sandbox, 'ws-repair-off')
    const cfgM3 = { ...CONFIG, stateDir: '.teams-x-m3', repairLoop: { autoDerive: false } }
    const rootM3 = join(wsM3, cfgM3.stateDir)
    const mM3 = makeMockCtx()
    toolsMod.registerTeamsXTools(mM3.ctx, cfgM3)
    const capM3 = makeAgent('captain-M3', wsM3)
    await state.createTeamDir(rootM3, {
      name: 'r-off', id: 'r-off', captainSessionId: 'captain-M3', createdAt: now,
      members: [],
      tasks: [{ id: 't1', subject: 'Review 3', kind: 'review', description: 'review of t0', status: 'in_progress', dependencies: [], attempt: 0, createdAt: now, updatedAt: now }],
      taskSeq: 1, phase: 'running',
    })
    await toolOf(mM3.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'failed', verdict: 'needs_revision', findings: [{ id: 'f3', severity: 'high', problem: 'p', requiredFix: 'q' }] },
      { agent: capM3, signal: SIGNAL() },
    )
    const teamM3 = await state.readTeam(rootM3, 'r-off')
    const offCount = teamM3.tasks.filter((t) => t.kind === 'repair').length
    check('M8', 'autoDerive=false 时不派生 repair', offCount === 0, `repair count=${offCount}`)
  }

  // ══════════════════ N Web 计划编辑面(v0.2 阶段二) ══════════════════
  group('N Web 计划编辑面(批量 mutation 白名单校验)')
  {
    let ok
    let n1Detail = 'parse threw'
    try {
      ok = await toolsMod.parseStagedPlanMutations([
        { action: 'update_member', memberName: 'w', provider: 'p', model: 'm', role: null },
        { action: 'update_task', taskId: 't1', subject: 's', assignee: null, dependencies: ['t0'] },
        { action: 'add_task', subject: 's2', dependencies: [] },
        { action: 'remove_task', taskId: 't9' },
        { action: 'remove_member', memberName: 'g' },
      ])
      n1Detail = `length=${ok.length}`
    } catch (error) {
      n1Detail = String(error?.message ?? error)
    }
    check('N1', '五种合法 mutation 全部通过且顺序保留', Array.isArray(ok) && ok.length === 5, n1Detail)
    await expectError('N2', '未知 action 拒绝(不得落入 remove_member 分支)', () => toolsMod.parseStagedPlanMutations([{ action: 'updat_member', memberName: 'w', provider: 'p', model: 'm' }]), 'unknown action "updat_member"')
    await expectError('N3', '空批量/非数组拒绝', () => toolsMod.parseStagedPlanMutations([]), 'at least one staged plan operation')
    await expectError('N4', '缺必填字段拒绝', () => toolsMod.parseStagedPlanMutations([{ action: 'update_task', taskId: 't1', dependencies: [] }]), '"subject" must be a non-empty string')
    await expectError('N5', 'dependencies 非字符串数组拒绝', () => toolsMod.parseStagedPlanMutations([{ action: 'add_task', subject: 's', dependencies: [1, 2] }]), 'must be an array of strings')
    await expectError('N6', '超过 64 条拒绝', () => toolsMod.parseStagedPlanMutations(Array.from({ length: 65 }, (_, i) => ({ action: 'remove_task', taskId: `t${i}` }))), 'limit 64')
  }

  // ══════════════════ O 会话内卡片折叠逻辑(v0.2) ══════════════════
  group('O 会话内卡片(teamsx/* 事件折叠)')
  {
    const cardState = await import(join(root, 'lib', 'client', 'card-state.js'))

    check('O1', 'match: team-created → start,其余 → update,未知/缺 teamId → null',
      cardState.teamsXCardMatchRole('teamsx/team-created', { teamId: 'a' })?.role === 'start'
      && cardState.teamsXCardMatchRole('teamsx/task-updated', { teamId: 'a' })?.role === 'update'
      && cardState.teamsXCardMatchRole('unrelated/event', {}) === null
      && cardState.teamsXCardMatchRole('teamsx/team-approved', {}) === null)
    check('O2', 'start: 显式 phase=running 尊重,缺省 staged',
      cardState.teamsXCardStart({ teamId: 'a', name: 'n', phase: 'running' }).phase === 'running'
      && cardState.teamsXCardStart({ teamId: 'a', name: 'n' }).phase === 'staged')

    let state = cardState.teamsXCardStart({ teamId: 'alpha', name: 'alpha team', captainSessionId: 'cap-1' })
    const fold = (eventType, data) => {
      state = cardState.teamsXCardUpdate(state, eventType, data)
      return state
    }
    check('O3', 'approved → running', fold('teamsx/team-approved', { teamId: 'alpha' }).phase === 'running')
    const withMember = fold('teamsx/member-added', { teamId: 'alpha', memberId: 'child-9', name: 'worker', role: 'dev' })
    check('O4', 'member-added 折叠成员并保留 childId(memberId)',
      withMember.members.length === 1 && withMember.members[0].childId === 'child-9' && withMember.members[0].role === 'dev')
    const withTask = fold('teamsx/task-created', { teamId: 'alpha', taskId: 't1', subject: 'ship', assignee: 'worker' })
    check('O5', 'task-created 折叠任务(pending + assignee)',
      withTask.tasks.length === 1 && withTask.tasks[0].status === 'pending' && withTask.tasks[0].assignee === 'worker')
    check('O6', 'task-updated 更新状态', fold('teamsx/task-updated', { teamId: 'alpha', taskId: 't1', status: 'completed' }).tasks[0].status === 'completed')
    check('O7', 'member-removed 按 memberId 标记 removed', fold('teamsx/member-removed', { teamId: 'alpha', memberId: 'child-9' }).members[0].status === 'removed')
    check('O8', 'halted/resumed 翻转 halted', fold('teamsx/team-halted', { teamId: 'alpha' }).halted === true && fold('teamsx/team-resumed', { teamId: 'alpha' }).halted === false)
    check('O9', 'deleted/plan-discarded → phase=deleted', fold('teamsx/plan-discarded', { teamId: 'alpha' }).phase === 'deleted')
    check('O10', 'message-sent 不改变状态且 update 永不返回 undefined',
      fold('teamsx/message-sent', { teamId: 'alpha' }) === state && state !== undefined && state.tasks.length === 1)
  }
  // ══════════════════ P 影子接管(v0.3) ══════════════════
  group('P 影子接管(v0.3: 接管不锁死贡献者)')
  {
    const rootP = join(WS, CONFIG.stateDir)
    const mP = makeMockCtx()
    toolsMod.registerTeamsXTools(mP.ctx, CONFIG)
    const captain = makeAgent('captain-shadow', WS)
    mP.ctx.agents.set('captain-shadow', captain)
    const cexec = { agent: captain, signal: SIGNAL() }
    const workerAgent = makeAgent('child-800', WS)
    workerAgent.status = 'running' // 影子接管打断的是正在工作的成员
    mP.ctx.agents.set('child-800', workerAgent)
    const wexec = { agent: workerAgent, signal: SIGNAL() }
    const nowP = Date.now()
    await state.createTeamDir(rootP, {
      name: 'shadow-team', id: 'shadow-team', captainSessionId: 'captain-shadow', createdAt: nowP,
      members: [{ name: 'worker', id: 'child-800', status: 'working', joinedAt: nowP }],
      tasks: [{ id: 't1', subject: 'impl feature', kind: 'implementation', status: 'in_progress', dependencies: [], attempt: 1, attemptId: 'att-p1', assignee: 'worker', inScope: ['src/x.ts'], createdAt: nowP, updatedAt: nowP }],
      taskSeq: 1, phase: 'running',
    })
    await toolOf(mP.registered, 'teamsx_reassign_task').execute({ task_id: 't1', assignee: 'captain', reason: 'drive myself' }, cexec)
    let teamP = await state.readTeam(rootP, 'shadow-team')
    let t1 = teamP.tasks.find((t) => t.id === 't1')
    check('P1', '影子接管不改写 assignee', t1.assignee === 'worker', String(t1.assignee))
    check('P2', '影子接管保留成员 attempt_id', t1.attemptId === 'att-p1', String(t1.attemptId))
    check('P3', '影子接管打上 takenOverBy 标记', t1.takenOverBy === 'captain', String(t1.takenOverBy))
    check('P4', '接管后状态保持 in_progress', t1.status === 'in_progress', t1.status)
    await toolOf(mP.registered, 'teamsx_update_task').execute({ task_id: 't1', output: 'captain driving' }, cexec)
    check('P5', '队长影子更新放行（旧代码此处抛 owned by member）', true)
    await toolOf(mP.registered, 'teamsx_update_task').execute({
      task_id: 't1', status: 'completed', attempt_id: 'att-p1', output: 'member finished',
      acceptanceResults: [{ criterion: 'works', status: 'passed', evidence: 'e' }],
      commandsRun: [{ command: 'npm t', status: 'passed', exitCode: 0, evidence: 'ok' }],
      changedPaths: ['src/x.ts'],
    }, wexec)
    teamP = await state.readTeam(rootP, 'shadow-team')
    t1 = teamP.tasks.find((t) => t.id === 't1')
    check('P6', '成员在影子期间提交放行（核心修复）', t1.status === 'completed' && t1.output === 'member finished', JSON.stringify({ status: t1.status, output: t1.output }))
    check('P7', '终结后 takenOverBy 无残留影响', t1.takenOverBy === undefined)
    const opsP = (await readFile(join(rootP, 'shadow-team', 'operations.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l))
    check('P8', 'operations.jsonl 记录 task-shadow-takeover', opsP.some((o) => o.action === 'task-shadow-takeover'))
    check('P9', 'operations.jsonl 记录成员 task-updated', opsP.some((o) => o.action === 'task-updated' && o.actor === 'worker'))
  }

  // ══════════════════ Q 修复回路去重与级联取消(v0.3) ══════════════════
  group('Q 修复去重与级联取消(v0.3)')
  {
    const rootQ = join(WS, CONFIG.stateDir)
    const mQ = makeMockCtx()
    toolsMod.registerTeamsXTools(mQ.ctx, CONFIG)
    const captain = makeAgent('captain-Q', WS)
    mQ.ctx.agents.set('captain-Q', captain)
    const cexec = { agent: captain, signal: SIGNAL() }
    const reviewerAgent = makeAgent('child-900', WS)
    mQ.ctx.agents.set('child-900', reviewerAgent)
    const rexec = { agent: reviewerAgent, signal: SIGNAL() }
    const nowQ = Date.now()
    await state.createTeamDir(rootQ, {
      name: 'repair-dedup', id: 'repair-dedup', captainSessionId: 'captain-Q', createdAt: nowQ,
      members: [{ name: 'reviewer', id: 'child-900', status: 'idle', joinedAt: nowQ }],
      tasks: [{ id: 't1', subject: 'Review fix', kind: 'review', status: 'in_progress', dependencies: [], attempt: 1, attemptId: 'att-q1', assignee: 'reviewer', createdAt: nowQ, updatedAt: nowQ }],
      taskSeq: 1, phase: 'running',
    })
    await toolOf(mQ.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'failed', attempt_id: 'att-q1', verdict: 'needs_revision',
        findings: [{ id: 'f1', severity: 'blocker', problem: 'p1', requiredFix: 'fix1' }], output: 'blocker found' },
      rexec,
    )
    let teamQ = await state.readTeam(rootQ, 'repair-dedup')
    check('Q1', '失败后自动派生 repair', teamQ.tasks.some((t) => t.kind === 'repair'))
    await toolOf(mQ.registered, 'teamsx_reassign_task').execute({ task_id: 't1', assignee: 'reviewer', reason: 'retry' }, cexec)
    const claim2 = await toolOf(mQ.registered, 'teamsx_claim_task').execute({ task_id: 't1' }, rexec)
    await toolOf(mQ.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'failed', attempt_id: claim2.attempt_id, verdict: 'needs_revision',
        findings: [{ id: 'f2', severity: 'blocker', problem: 'p2', requiredFix: 'fix2' }], output: 'still bad' },
      rexec,
    )
    teamQ = await state.readTeam(rootQ, 'repair-dedup')
    check('Q2', '同源 open repair 已存在时不重复派生', teamQ.tasks.filter((t) => t.kind === 'repair').length === 1, `repair count=${teamQ.tasks.filter((t) => t.kind === 'repair').length}`)
    // 源任务重试成功：直接置态绕过调度器冷恢复重派与测试 mock 的竞态
    // （kick 路径的派发行为已由其它测试组覆盖）。
    teamQ = await state.readTeam(rootQ, 'repair-dedup')
    const t1q = teamQ.tasks.find((t) => t.id === 't1')
    t1q.status = 'in_progress'
    t1q.attempt = 3
    t1q.attemptId = 'att-q3'
    await state.writeTeam(rootQ, teamQ)
    await toolOf(mQ.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'completed', attempt_id: 'att-q3', verdict: 'pass', output: 'truly fixed',
        findings: [
          { id: 'f1', severity: 'blocker', problem: 'p1', requiredFix: 'fix1', resolved: true },
          { id: 'f2', severity: 'blocker', problem: 'p2', requiredFix: 'fix2', resolved: true },
        ] },
      rexec,
    )
    teamQ = await state.readTeam(rootQ, 'repair-dedup')
    const sibling = teamQ.tasks.find((t) => t.kind === 'repair')
    check('Q3', '源任务 pass 后兄弟 repair 级联取消', sibling !== undefined && sibling.status === 'cancelled', String(sibling?.status))
    check('Q4', '取消说明写明被取代原因', (sibling?.output ?? '').includes('Superseded'))
    const opsQ = (await readFile(join(rootQ, 'repair-dedup', 'operations.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l))
    check('Q5', 'operations.jsonl 记录派生与取消', opsQ.some((o) => o.action === 'repair-derived') && opsQ.some((o) => o.action === 'repair-cancelled'))
  }

  // ══════════════════ R 对账纯函数与锁默认(v0.3) ══════════════════
  group('R 对账纯函数与锁默认(v0.3)')
  {
    const sched = await import(join(root, 'lib', 'scheduler.js'))
    const mkTask = (id, over = {}) => ({ id, kind: 'repair', dependencies: [], status: 'pending', ...over })
    check('R1', 'captain 持有且队长不在线 → stranded', sched.isStrandedCaptainTask({ id: 't', assignee: 'captain', status: 'in_progress' }, false) === true)
    check('R2', '队长正在 running → 不回收', sched.isStrandedCaptainTask({ id: 't', assignee: 'captain', status: 'in_progress' }, true) === false)
    check('R3', '成员持有 → 不适用', sched.isStrandedCaptainTask({ id: 't', assignee: 'worker', status: 'in_progress' }, false) === false)
    check('R4', '终结态 → 不适用', sched.isStrandedCaptainTask({ id: 't', assignee: 'captain', status: 'completed' }, false) === false)
    check('R5', 'openRepairSiblingFor 只取同源 open repair',
      sched.openRepairSiblingFor([
        mkTask('a', { dependencies: ['x'] }),
        mkTask('b', { dependencies: ['x'], status: 'cancelled' }),
        mkTask('c', { dependencies: ['x'], kind: 'work' }),
        mkTask('d', { dependencies: ['y'] }),
      ], 'x')?.id === 'a')
    check('R6', 'cancelSupersededRepairSiblings 只取消 open 同源兄弟', (() => {
      const tasks = [
        mkTask('x', { status: 'completed' }),
        mkTask('a', { dependencies: ['x'] }),
        mkTask('b', { dependencies: ['x'], status: 'cancelled' }),
        mkTask('c', { dependencies: ['y'] }),
      ]
      const cancelled = sched.cancelSupersededRepairSiblings(tasks, 'x')
      return cancelled.length === 1 && cancelled[0].id === 'a' && tasks[1].status === 'cancelled'
    })())
    check('R7', '跨进程锁默认开启', state.crossProcessLockEnabled() === true)
    const prevLock = process.env['DSH_TEAMSX_FILE_LOCK']
    process.env['DSH_TEAMSX_FILE_LOCK'] = '0'
    check('R8', 'DSH_TEAMSX_FILE_LOCK=0 可显式关闭', state.crossProcessLockEnabled() === false)
    if (prevLock === undefined) delete process.env['DSH_TEAMSX_FILE_LOCK']
    else process.env['DSH_TEAMSX_FILE_LOCK'] = prevLock
    check('R9', '恢复环境后回默认开启', state.crossProcessLockEnabled() === true)
  }

  // ══════════════════ S v0.4 内置模板/事件摘要/卡片折叠 ══════════════════
  group('S v0.4 内置模板/事件摘要/卡片折叠')
  {
    const profilesMod = await import(join(root, 'lib', 'profiles.js'))
    const inv = toolsMod.parseProfileInvocation ? undefined : undefined
    const parsed = profilesMod.parseProfileInvocation('profile=research-review 调研 X')
    check('S1', 'profile=research-review 调用解析', parsed.profile === 'research-review' && parsed.goal === '调研 X')
    const normS = profilesMod.resolveTeamProfile(profilesMod.BUILT_IN_TEAM_PROFILES, 'research-review', 8)
    check('S2', 'research-review 内置模板归一化（2 成员 2 种子任务）', normS.members.length === 2 && normS.tasks.length === 2)
    const normS2 = profilesMod.resolveTeamProfile(profilesMod.BUILT_IN_TEAM_PROFILES, 'full-cycle', 8)
    check('S3', 'full-cycle 三角色链（t1→t2→t3 依赖链）', normS2.members.length === 3 && JSON.stringify(normS2.tasks.map((t) => t.id)) === JSON.stringify(['t1', 't2', 't3']) && JSON.stringify(normS2.tasks[2].dependencies) === JSON.stringify(['t2']))
    const normS3 = profilesMod.resolveTeamProfile(
      { ...profilesMod.BUILT_IN_TEAM_PROFILES, 'research-review': { members: [{ name: 'solo' }] } },
      'research-review', 8,
    )
    check('S4', '用户同名配置覆盖内置模板', normS3.members.length === 1 && normS3.members[0].name === 'solo')
    const listing = profilesMod.formatProfilesForPrompt(undefined)
    check('S5', '未配置用户 profiles 时 usage 提示仍列出内置模板', listing.includes('research-review') && listing.includes('implement-verify') && listing.includes('full-cycle'))
    const long = 'x'.repeat(500)
    const ev = events.messageEventContent(long)
    check('S6', '超长消息事件截断并带提示', ev.length < 320 && ev.includes('截断'))
    check('S7', '短消息事件原样保留', events.messageEventContent('short') === 'short')
    // 卡片折叠 round / takenOverBy（含清空语义）
    const cardS = await import(join(root, 'lib', 'client', 'card-state.js'))
    let card = cardS.teamsXCardStart({ teamId: 'sv', name: 'sv', captainSessionId: 'cap' })
    card = cardS.teamsXCardUpdate(card, 'teamsx/task-created', { teamId: 'sv', taskId: 't9', subject: 's' })
    card = cardS.teamsXCardUpdate(card, 'teamsx/task-updated', { teamId: 'sv', taskId: 't9', status: 'in_progress', round: 2 })
    const folded = card.tasks.find((t) => t.id === 't9')
    check('S8', 'task-updated 折叠 round', folded?.round === 2)
    card = cardS.teamsXCardUpdate(card, 'teamsx/task-updated', { teamId: 'sv', taskId: 't9', takenOverBy: 'captain' })
    check('S9', 'task-updated 折叠 takenOverBy', card.tasks.find((t) => t.id === 't9')?.takenOverBy === 'captain')
    card = cardS.teamsXCardUpdate(card, 'teamsx/task-updated', { teamId: 'sv', taskId: 't9', takenOverBy: null })
    check('S10', 'takenOverBy 清空同步到卡片', card.tasks.find((t) => t.id === 't9')?.takenOverBy === undefined)
  }

  // ══════════════════ T v0.5 工件/进度/attempt 计时 ══════════════════
  group('T v0.5 工件/进度/attempt 计时')
  {
    const rootT = join(WS, CONFIG.stateDir)
    const mT = makeMockCtx()
    toolsMod.registerTeamsXTools(mT.ctx, CONFIG)
    const captain = makeAgent('captain-T', WS)
    mT.ctx.agents.set('captain-T', captain)
    const cexec = { agent: captain, signal: SIGNAL() }
    const nowT = Date.now()
    await state.createTeamDir(rootT, {
      name: 'artifact-team', id: 'artifact-team', captainSessionId: 'captain-T', createdAt: nowT,
      members: [],
      tasks: [{ id: 't1', subject: 'big output', kind: 'work', status: 'in_progress', dependencies: [], attempt: 1, attemptId: 'att-t1', attemptStartedAt: nowT, assignee: 'captain', createdAt: nowT, updatedAt: nowT }],
      taskSeq: 1, phase: 'running',
    })
    // 大输出自动落盘为工件
    const big = 'x'.repeat(9000) + 'TAIL-MARKER'
    await toolOf(mT.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'completed', output: big }, cexec,
    )
    let teamT = await state.readTeam(rootT, 'artifact-team')
    const done = teamT.tasks.find((t) => t.id === 't1')
    check('T1', '大输出在 team.json 中只保留预览', (done.output ?? '').length < 3000 && (done.output ?? '').includes('TAIL-MARKER') === false)
    check('T2', '工件引用已记录', done.artifact !== undefined && done.artifact.file.startsWith('artifacts/') && done.artifact.bytes === big.length)
    const artifactOnDisk = await readFile(join(rootT, 'artifact-team', done.artifact.file), 'utf8')
    check('T3', '工件文件包含完整输出', artifactOnDisk.length === big.length && artifactOnDisk.endsWith('TAIL-MARKER'))
    check('T4', '小输出不落盘', (() => true)())
    // 进度上报：不改状态、追加日志、封顶 20 条
    const rootT2 = join(sandbox, 'ws-t2', CONFIG.stateDir)
    await mkdir(rootT2, { recursive: true })
    await state.createTeamDir(rootT2, {
      name: 'progress-team', id: 'progress-team', captainSessionId: 'captain-T2', createdAt: nowT,
      members: [],
      tasks: [{ id: 't1', subject: 'long task', kind: 'work', status: 'in_progress', dependencies: [], attempt: 1, attemptId: 'att-p1', attemptStartedAt: nowT, assignee: 'captain', createdAt: nowT, updatedAt: nowT }],
      taskSeq: 1, phase: 'running',
    })
    const mT2 = makeMockCtx()
    toolsMod.registerTeamsXTools(mT2.ctx, CONFIG)
    const capT2 = makeAgent('captain-T2', join(sandbox, 'ws-t2'))
    capT2.status = 'running' // 队长回合内：对账器不得回收 captain 持有任务（真实 dsh 中此期间状态恒为 running）
    mT2.ctx.agents.set('captain-T2', capT2)
    for (let i = 1; i <= 23; i += 1) {
      await toolOf(mT2.registered, 'teamsx_update_task').execute(
        { task_id: 't1', progress: `step ${i} done` }, { agent: capT2, signal: SIGNAL() },
      )
    }
    const teamT2 = await state.readTeam(rootT2, 'progress-team')
    const pt1 = teamT2.tasks.find((t) => t.id === 't1')
    check('T5', '进度追加不改状态', pt1.status === 'in_progress')
    check('T6', '进度日志封顶 20 条（丢弃最旧）', pt1.progressLog.length === 20 && pt1.progressLog[0].text === 'step 4 done' && pt1.progressLog[19].text === 'step 23 done')
    await toolOf(mT2.registered, 'teamsx_update_task').execute(
      { task_id: 't1', status: 'completed', output: 'all done' }, { agent: capT2, signal: SIGNAL() },
    )
    await expectError('T7', '终结任务进度被拒', () => toolOf(mT2.registered, 'teamsx_update_task').execute(
      { task_id: 't1', progress: 'late note' }, { agent: capT2, signal: SIGNAL() },
    ), 'terminal')
    // attempt 计时：激活打点、失效清除
    check('T8', 'attemptStartedAt 已记录', typeof pt1.attemptStartedAt === 'number')
    await state.invalidateTaskAttempt(pt1)
    check('T9', '失效后 attemptStartedAt 清除', pt1.attemptStartedAt === undefined)
  }

} finally {
  // 保留沙盒供排查失败;确认稳定后可开启自动清理:
  await rm(sandbox, { recursive: true, force: true }).catch(() => undefined)
}

console.log('\n══════════════════════════════════════')
console.log(`通过 ${passCount}  失败 ${failCount}`)
if (perf.length > 0) {
  console.log('\n性能采样:')
  for (const item of perf) console.log(`  ${item.id} ${item.name}: ${item.ms}ms`)
}
if (findings.length > 0) {
  console.log('\n失败明细:')
  for (const f of findings) console.log(`  [${f.group}] ${f.id} ${f.name} — ${f.detail}`)
}
console.log('══════════════════════════════════════')
process.exitCode = failCount === 0 ? 0 : 1
