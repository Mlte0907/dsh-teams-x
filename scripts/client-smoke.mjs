/**
 * Client bundle smoke test: execute lib/client.js under a mock ModuleLoader
 * environment (browser globals + externals require), apply the plugin against
 * a mock client context, then server-render the ActivityPanel to surface any
 * render-time crash. Exit 0 = clean.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// ── browser-ish globals ──
const loadedModules = new Map()
globalThis.window = {
  __ModuleLoader__: {
    load(spec) {
      loadedModules.set(spec.id, spec)
    },
  },
  setInterval: () => 0,
  clearInterval: () => {},
  localStorage: { getItem: () => null, setItem: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
}
globalThis.document = undefined // absent like pre-DOM; bundle guards on it
globalThis.fetch = async () => ({ ok: true, json: async () => ({ teams: [] }) })

// ── externals table (what the host module table answers) ──
const optionalExternal = (id) => {
  try { return require(id) } catch { return {} }
}
const externals = {
  react: require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react-dom': optionalExternal('react-dom'),
  'react-dom/client': optionalExternal('react-dom/client'),
  '@deepseek-ai/cordis': require('@deepseek-ai/cordis'),
}
const moduleRequire = (id) => {
  if (id in externals) return externals[id]
  throw new Error(`mock module table cannot answer "${id}"`)
}

// ── execute the bundle ──
const code = readFileSync(join(root, '..', 'lib', 'client.js'), 'utf8')
const run = new Function('window', 'require', 'globalThis', code)
run(globalThis.window, moduleRequire, globalThis)

const spec = loadedModules.get('dsh-teams-x')
if (spec === undefined) {
  console.error('FAIL: bundle did not register under id "dsh-teams-x"')
  process.exit(1)
}
const plugin = spec.factory(moduleRequire)
console.log('apply/inject exports:', typeof plugin.apply, JSON.stringify(plugin.inject))

// ── apply against a mock client ctx ──
const registered = { locale: [], slots: [], conversationDefs: [], commands: [], tabs: [] }
// The renderer stub, shared by the root ctx and the services a deferred inject
// hands back (a real fork exposes `slots` the same way, as a property).
const slotsStub = {
  inject(slotName, register) {
    registered.slots.push(slotName)
    register()
  },
  register(spec, component) {
    registered.slots.push(`register:${spec.name}`)
    console.log(`slot registered: ${spec.name} (order ${spec.order}, locale ${spec.locale})`)
    return () => {}
  },
}
const mockServices = {
  slots: slotsStub,
  commandUi: {
    register(contribution) {
      registered.commands.push(contribution?.name)
      console.log(`command registered: /${contribution?.name} (${contribution?.ui?.kind})`)
    },
  },
  // 0.1.5-rc.1 right Sidebar tab registry: the plugin registers through a
  // deferred inject, so this stub is what exercises that path under test.
  sidebarRightTabs: {
    register(definition) {
      registered.tabs.push(definition?.id)
      console.log(`sidebar tab type registered: ${definition?.id}/${definition?.kind}, guide ${definition?.guide?.length ?? 0}`)
      return () => {}
    },
  },
}
const mockCtx = {
  effect(fn, label) {
    fn()
    console.log('effect:', label)
  },
  inject(deps, fn) {
    // A real cordis fork exposes injected services as properties (and via get).
    fn({ get: (name) => mockServices[name], ...mockServices })
  },
  locale: {
    register(ns, dicts) {
      registered.locale.push(ns)
      const keys = Object.keys(dicts.zh ?? {})
      console.log(`locale.register("${ns}") zh keys: ${keys.length}, en keys: ${Object.keys(dicts.en ?? {}).length}`)
      const enKeys = new Set(Object.keys(dicts.en ?? {}))
      const missing = keys.filter((k) => !enKeys.has(k))
      if (missing.length > 0) throw new Error(`en dictionary missing keys: ${missing.join(', ')}`)
    },
    bind(namespace) {
      return (key) => `${namespace}:${key}`
    },
  },
  slots: slotsStub,
  uiConversation: {
    events: {
      register(definition) {
        registered.conversationDefs.push(definition?.kind)
        console.log(`conversation definition registered: ${definition?.kind} (target ${definition?.target})`)
      },
    },
  },
}
plugin.apply(mockCtx)
if (!registered.conversationDefs.includes('teamsx')) {
  throw new Error('teamsx conversation definition was not registered')
}
if (!registered.commands.includes('teamsx')) {
  throw new Error('/teamsx command contribution was not registered')
}

// ── server-render the panel to catch render crashes ──
// SSR skips effects, so the panel starts with empty state and must render
// nothing at all (the collapsed badge only appears once data arrives).
const { renderToString } = await import('react-dom/server')
const React = externals.react
const { ActivityPanel } = await import('../lib/client/ActivityPanel.js')
const t = (key, params) => (params === undefined ? key : `${key}?${JSON.stringify(params)}`)
const emptyHtml = renderToString(React.createElement(ActivityPanel, {
  sessionId: 'session-smoke',
  t,
  sessions: {},
  openMember: () => {},
}))
if (emptyHtml.trim() !== '') {
  throw new Error(`badge must be hidden for a session without teams, got ${emptyHtml.length} chars`)
}
console.log('session without teams renders no badge (PASS)')

// ── SSR the in-chat team card to catch render crashes ──
const { TeamsXCardPanel } = await import('../lib/client/TeamsXCardPanel.js')
const cardNode = {
  key: 'k1',
  kind: 'teamsx-card',
  id: 'alpha-team',
  target: 'chat',
  data: {
    name: 'alpha team',
    captainSessionId: 'cap-1',
    phase: 'running',
    halted: false,
    members: [
      { name: 'worker', childId: 'child-9', status: 'active' },
      { name: 'gone', status: 'removed' },
    ],
    tasks: [
      { id: 't1', subject: 'Ship it', status: 'completed' },
      { id: 't2', subject: 'Review', status: 'pending' },
    ],
  },
}
const cardHtml = renderToString(React.createElement(TeamsXCardPanel, {
  node: cardNode,
  t,
  openMember: () => {},
}))
if (!cardHtml.includes('alpha team') || !cardHtml.includes('worker') || !cardHtml.includes('Ship it')) {
  throw new Error(`team card render is missing expected content (${cardHtml.length} chars)`)
}
console.log('team card SSR renders roster and tasks (PASS)')

// A card without data must render nothing (defensive against drift).
const emptyCardHtml = renderToString(React.createElement(TeamsXCardPanel, {
  node: { key: 'k2', kind: 'teamsx-card', id: 'x', target: 'chat', data: { name: '' } },
  t,
  openMember: () => {},
}))
if (emptyCardHtml.trim() !== '') {
  throw new Error(`unnamed card must render nothing, got ${emptyCardHtml.length} chars`)
}
console.log('unnamed card renders nothing (PASS)')

// ── open-request channel ack behavior ──
const { requestTeamsXPanel, onTeamsXPanelRequest, onTeamsXPanelUnclaimed } = await import('../lib/client/open-request.js')
let claimedByListener = false
const unsubClaim = onTeamsXPanelRequest((target) => {
  if (target === 'test-session') {
    claimedByListener = true
    return true
  }
  return false
})
const claimed = requestTeamsXPanel('test-session')
if (!claimed || !claimedByListener) {
  throw new Error(`ack: requestTeamsXPanel should return true when a listener claims, got claimed=${claimed}`)
}
unsubClaim()
const claimedAfterUnsub = requestTeamsXPanel('test-session')
if (claimedAfterUnsub) {
  throw new Error('ack: requestTeamsXPanel should return false after listener unsubscribed')
}
console.log('open-request ack: claimed=true with listener, false after unsubscribe (PASS)')

// ── unclaimed channel fires when nobody claims ──
let unclaimedReceived = undefined
const unsubUnclaimed = onTeamsXPanelUnclaimed((sessionId) => {
  unclaimedReceived = sessionId
})
const claimedNoListener = requestTeamsXPanel('no-panel-session')
if (claimedNoListener) {
  throw new Error('unclaimed: requestTeamsXPanel should return false with no listeners')
}
if (unclaimedReceived !== 'no-panel-session') {
  throw new Error(`unclaimed: listener should receive sessionId, got ${unclaimedReceived}`)
}
unsubUnclaimed()
const unclaimedAfterUnsub = requestTeamsXPanel('no-panel-session')
if (unclaimedReceived !== 'no-panel-session') {
  throw new Error('unclaimed: listener should not fire after unsubscribe')
}
console.log('unclaimed channel: fires on no-claim, silent after unsubscribe (PASS)')

// ── hint host slot registration ──
if (!registered.slots.includes('sidebar.footer.action')) {
  throw new Error(`hint host: sidebar.footer.action slot not registered, got ${registered.slots.join(', ')}`)
}
console.log('hint host slot registered: sidebar.footer.action (PASS)')

// ── 0.1.5-only hosts: right Sidebar tab + its two seats ──
// (2026-09-12) panel-icon row / main panel removed by product decision — only
// the right Sidebar tab seats are asserted.
for (const slot of ['sidebar.right.pane.tab', 'sidebar.right.pane.tab.title']) {
  if (!registered.slots.includes(`register:${slot}`)) {
    throw new Error(`panel hosts: ${slot} not registered, got ${registered.slots.join(', ')}`)
  }
}
if (!registered.tabs.includes('teams-x')) {
  throw new Error(`panel hosts: right Sidebar tab type not registered, got ${registered.tabs.join(', ')}`)
}
console.log('panel hosts registered: right Sidebar tab (PASS)')

// ── the right Sidebar tab body renders without a crash (SSR) ──
const { TeamsXTabBody } = await import('../lib/client/panel-hosts.js')
const tabHtml = renderToString(React.createElement(TeamsXTabBody, {
  sessionId: 'session-smoke',
  t,
  openMember: () => {},
}))
if (tabHtml.trim() === '') throw new Error('tab body SSR rendered nothing')
console.log('tab body SSR render (PASS)')

// ── hint host SSR safety (visible=false → renders nothing) ──
const { TeamsXHintHost } = await import('../lib/client/hint-host.js')
const hintHtml = renderToString(React.createElement(TeamsXHintHost, {
  wide: true,
  t,
}))
if (hintHtml.trim() !== '') {
  throw new Error(`hint host SSR must render nothing (visible=false), got ${hintHtml.length} chars`)
}
console.log('hint host SSR renders nothing when visible=false (PASS)')

// ── 印记系统 (member-identity): stable ink + bilingual keyword sigils ──
const { memberInkIndex, memberInk, memberSigil } = await import('../lib/client/member-identity.js')
const inkA = memberInkIndex('worker-a')
if (memberInkIndex('worker-a') !== inkA || inkA < 0 || inkA > 5) {
  throw new Error(`memberInkIndex must be deterministic within 0..5, got ${inkA}`)
}
if (memberInk('worker-a') !== `var(--tx-mate-${inkA})`) {
  throw new Error(`memberInk must map to its slot var, got ${memberInk('worker-a')}`)
}
for (const [name, role, expected] of [
  ['张三', '工程师', 'engineer'],
  ['Li', 'data analyst', 'data'],
  ['老王', '测试与验收', 'qa'],
  ['队长', '', 'lead'],
  ['小明', '前端设计', 'designer'],
  ['nobody', '神秘角色', undefined],
]) {
  const got = memberSigil(name, role)
  if (got !== expected) throw new Error(`memberSigil(${name}, ${role}) = ${got}, want ${expected}`)
}
console.log('member-identity: deterministic ink + keyword sigils (PASS)')

// ── 静默轮询闸门 (snapshot-compare): identical → true, changed → false ──
const { sameTeamsSnapshots } = await import('../lib/client/snapshot-compare.js')
if (!sameTeamsSnapshots([], [])) throw new Error('empty snapshots must compare equal')
const teamBase = [{
  workspace: 'w',
  teamId: 'alpha',
  name: 'alpha',
  captainSessionId: 'cap',
  phase: 'running',
  members: [{
    id: 'm1', name: 'worker', role: '工程师', provider: 'ds', model: 'm', status: 'active',
    activity: 'working', progress: 50, done: 1, total: 2, currentTask: 't1', unread: 0,
  }],
  tasks: [{
    id: 't1', subject: 'S', description: '', status: 'in_progress', state: 'running',
    assignee: 'worker', model: 'm', dependencies: [], depth: 0,
  }],
  messageCount: 1,
  captainInbox: [{ from: 'worker', content: '**done** `t1`' }],
  operations: [],
}]
if (!sameTeamsSnapshots(teamBase, structuredClone(teamBase))) {
  throw new Error('identical snapshots must compare equal')
}
const tickSame = structuredClone(teamBase)
tickSame[0].members[0].progress = 50 // same value, new objects → still equal
if (!sameTeamsSnapshots(teamBase, tickSame)) {
  throw new Error('value-equal snapshots must compare equal (new object identities)')
}
const tickChanged = structuredClone(teamBase)
tickChanged[0].captainInbox[0].content = 'new report'
if (sameTeamsSnapshots(teamBase, tickChanged)) {
  throw new Error('changed inbox content must not compare equal')
}
console.log('snapshot-compare: quiet-poll gate equal/changed (PASS)')

// ── RichText: react-element rendering, no HTML strings, XSS inert ──
const { RichText } = await import('../lib/client/rich-text.js')
const mdHtml = renderToString(React.createElement(RichText, {
  text: '汇报 **完成** `t1`\n- 第一条\n- 第二条\n```\nprint(1)\n```',
}))
if (!mdHtml.includes('<strong')) throw new Error('rich text: bold missing')
if (!mdHtml.includes('<code')) throw new Error('rich text: code span missing')
if (!mdHtml.includes('<ul>')) throw new Error('rich text: list missing')
if (!mdHtml.includes('<pre>')) throw new Error('rich text: fence missing')
const xssHtml = renderToString(React.createElement(RichText, {
  text: '<img src=x onerror=alert(1)>',
}))
if (xssHtml.includes('<img')) throw new Error('rich text: raw HTML leaked into output')
if (!xssHtml.includes('&lt;img')) throw new Error('rich text: hostile text not escaped')
const blankHtml = renderToString(React.createElement(RichText, { text: '   \n  ' }))
if (blankHtml !== '') throw new Error('rich text: blank input must render nothing')
console.log('rich-text: element rendering + inert hostile content (PASS)')

// ── 脉搏折叠 (beatActivity): fresh beat wins, stale beat hands back ──
const { beatActivity } = await import('../lib/client/live-activity.js')
const now = Date.now()
if (beatActivity('idle', { running: true, seenAt: now }, now) !== 'working') {
  throw new Error('fresh running beat must read working')
}
if (beatActivity('working', { running: false, seenAt: now }, now) !== 'idle') {
  throw new Error('fresh idle beat must demote polled working to idle')
}
if (beatActivity('idle', { running: false, seenAt: now - 60_000 }, now) !== 'idle') {
  throw new Error('stale beat must hand authority back to the poll')
}
if (beatActivity('idle', undefined, now) !== 'idle') {
  throw new Error('no beat must keep polled activity')
}
console.log('live-activity: beat authority model (PASS)')

console.log('client bundle smoke test: PASS (load + apply + render)')
