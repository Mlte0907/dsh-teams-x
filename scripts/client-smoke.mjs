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
const registered = { locale: [], slots: [], conversationDefs: [], commands: [] }
const mockServices = {
  commandUi: {
    register(contribution) {
      registered.commands.push(contribution?.name)
      console.log(`command registered: /${contribution?.name} (${contribution?.ui?.kind})`)
    },
  },
}
const mockCtx = {
  effect(fn, label) {
    fn()
    console.log('effect:', label)
  },
  inject(deps, fn) {
    fn({ get: (name) => mockServices[name] })
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
  },
  slots: {
    inject(slotName, register) {
      registered.slots.push(slotName)
      register()
    },
    register(spec2, component) {
      registered.slots.push(`register:${spec2.name}`)
      console.log(`slot registered: ${spec2.name} (order ${spec2.order}, locale ${spec2.locale})`)
      return () => {}
    },
  },
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
console.log('client bundle smoke test: PASS (load + apply + render)')
