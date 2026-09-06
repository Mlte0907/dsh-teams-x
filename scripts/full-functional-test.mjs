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
    await toolOf(registered, 'teamsx_update_task').execute({ task_id: t2.task_id, status: 'in_progress', attempt_id: claim.attempt_id }, m2exec)
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
    await toolOf(ctxR.registered, 'teamsx_claim_task').execute({ task_id: rt.task_id, assignee: 'rw' }, rexec)
    await expectError('F19', '重派到不存在成员拒绝', () => toolOf(ctxR.registered, 'teamsx_reassign_task').execute({ task_id: rt.task_id, assignee: 'ghost' }, rexec), 'no active member named "ghost"')
    const re = await toolOf(ctxR.registered, 'teamsx_reassign_task').execute({ task_id: rt.task_id, assignee: 'captain', reason: 'takeover' }, rexec)
    check('F19b', 'captain 接管 → in_progress + 新 attempt', re.assignee === 'captain' && re.status === 'in_progress' && typeof re.attempt_id === 'string')
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
