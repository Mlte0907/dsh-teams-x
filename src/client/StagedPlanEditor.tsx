/**
 * Inline staged-plan editor rendered under the review bar for staged teams.
 *
 * Edits accumulate locally as pending mutations; "save" posts them as one
 * atomic batch through the /plan edit route, then the panel's poll cycle
 * renders disk truth. Collapsed by default so the review bar stays primary.
 * All types come from the zero-import snapshot module, so this file never
 * pulls in the host graph.
 * @module dsh-teams-x/client/StagedPlanEditor
 */
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { StagedPlanMutation, TeamActivitySnapshot } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import { TEAMSX_PLAN_URL } from './ActivityPanel.tsx'
import css from './ActivityPanel.module.css'

/** The editor's translate function (same shape the panel uses). */
type TFunc = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string

interface MemberDraft {
  name: string
  role: string
  provider: string
  model: string
  remove: boolean
}

interface TaskDraft {
  id: string
  subject: string
  assignee: string
  deps: string
  remove: boolean
  isNew: boolean
}

/** Split a free-form dependency input ("t1, t2 / t3") into clean ids. */
function splitDeps(raw: string): string[] {
  return raw.split(/[,，、;；]/gu).map((item) => item.trim()).filter((item) => item !== '')
}

/** POST one atomic staged-plan edit batch. */
async function planEdit(captainSessionId: string, teamId: string, mutations: StagedPlanMutation[]): Promise<void> {
  const response = await fetch(TEAMSX_PLAN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId, action: 'edit', mutations }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

function initialMembers(team: TeamActivitySnapshot): MemberDraft[] {
  return team.members.map((member) => ({
    name: member.name,
    role: member.role,
    provider: member.provider,
    model: member.model,
    remove: false,
  }))
}

function initialTasks(team: TeamActivitySnapshot): TaskDraft[] {
  return team.tasks.map((task) => ({
    id: task.id,
    subject: task.subject,
    assignee: task.assignee,
    deps: task.dependencies.join(', '),
    remove: false,
    isNew: false,
  }))
}

/** The staged-plan editor: roster rows + task rows + one atomic save. */
export function StagedPlanEditor({ team, t, onSaved }: {
  team: TeamActivitySnapshot
  t: TFunc
  onSaved: () => void
}): ReactElement {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<MemberDraft[]>(() => initialMembers(team))
  const [tasks, setTasks] = useState<TaskDraft[]>(() => initialTasks(team))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const reset = (): void => {
    setMembers(initialMembers(team))
    setTasks(initialTasks(team))
    setError(undefined)
  }

  const save = async (): Promise<void> => {
    const mutations: StagedPlanMutation[] = []
    for (const draft of members) {
      if (draft.remove) {
        mutations.push({ action: 'remove_member', memberName: draft.name })
        continue
      }
      const initial = team.members.find((member) => member.name === draft.name)
      if (initial === undefined) continue
      if (initial.role === draft.role && initial.provider === draft.provider && initial.model === draft.model) continue
      if (draft.provider.trim() === '' || draft.model.trim() === '') {
        setError(t('editor.subjectRequired'))
        return
      }
      mutations.push({
        action: 'update_member',
        memberName: draft.name,
        role: draft.role.trim() || null,
        provider: draft.provider.trim(),
        model: draft.model.trim(),
        reasoningEffort: null,
        executionPrompt: null,
      })
    }
    for (const draft of tasks) {
      if (draft.isNew) {
        if (draft.subject.trim() === '' && draft.assignee.trim() === '' && draft.deps.trim() === '') continue
        if (draft.subject.trim() === '') {
          setError(t('editor.subjectRequired'))
          return
        }
        mutations.push({
          action: 'add_task',
          subject: draft.subject.trim(),
          assignee: draft.assignee.trim() || null,
          dependencies: splitDeps(draft.deps),
        })
        continue
      }
      if (draft.remove) {
        mutations.push({ action: 'remove_task', taskId: draft.id })
        continue
      }
      const initial = team.tasks.find((task) => task.id === draft.id)
      if (initial === undefined) continue
      const deps = splitDeps(draft.deps)
      if (initial.subject === draft.subject && initial.assignee === draft.assignee
        && initial.dependencies.join(', ') === deps.join(', ')) continue
      if (draft.subject.trim() === '') {
        setError(t('editor.subjectRequired'))
        return
      }
      mutations.push({
        action: 'update_task',
        taskId: draft.id,
        subject: draft.subject.trim(),
        assignee: draft.assignee.trim() || null,
        dependencies: deps,
      })
    }
    if (mutations.length === 0) {
      setOpen(false)
      return
    }
    setBusy(true)
    setError(undefined)
    try {
      await planEdit(team.captainSessionId, team.teamId, mutations)
      setBusy(false)
      setOpen(false)
      onSaved()
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div className={css.planEditor}>
        <button type='button' className={css.planEditorToggle} onClick={() => { setOpen(true) }}>
          ✎ {t('editor.open')}
        </button>
      </div>
    )
  }

  return (
    <div className={css.planEditor} role='form' aria-label={t('editor.open')}>
      <div className={css.planEditorSection}>
        <h5 className={css.planEditorHeading}>{t('editor.members')}</h5>
        {members.map((draft, index) => (
          <div key={draft.name} className={css.planEditorRow} data-remove={draft.remove === true || undefined}>
            <span className={css.planEditorName} title={draft.name}>{draft.name}</span>
            <input
              className={css.planEditorInput}
              aria-label={t('editor.role')}
              placeholder={t('editor.role')}
              value={draft.role}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setMembers((prev) => prev.map((item, i) => (i === index ? { ...item, role: value } : item)))
              }}
            />
            <input
              className={css.planEditorInput}
              aria-label={t('editor.provider')}
              placeholder={t('editor.provider')}
              value={draft.provider}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setMembers((prev) => prev.map((item, i) => (i === index ? { ...item, provider: value } : item)))
              }}
            />
            <input
              className={css.planEditorInput}
              aria-label={t('editor.model')}
              placeholder={t('editor.model')}
              value={draft.model}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setMembers((prev) => prev.map((item, i) => (i === index ? { ...item, model: value } : item)))
              }}
            />
            <button
              type='button'
              className={css.planEditorRemove}
              disabled={busy}
              onClick={() => {
                setMembers((prev) => prev.map((item, i) => (i === index ? { ...item, remove: !item.remove } : item)))
              }}
            >
              {draft.remove ? t('editor.restore') : t('editor.remove')}
            </button>
          </div>
        ))}
        {members.length === 0 && <p className={css.planEditorEmpty}>{t('editor.members')}: 0</p>}
      </div>

      <div className={css.planEditorSection}>
        <h5 className={css.planEditorHeading}>{t('editor.tasks')}</h5>
        {tasks.map((draft, index) => (
          <div key={draft.id} className={css.planEditorRow} data-remove={draft.remove === true || undefined}>
            <span className={css.planEditorTaskId}>{draft.isNew ? '＋' : draft.id}</span>
            <input
              className={`${css.planEditorInput} ${css.planEditorSubject}`}
              aria-label={t('editor.subject')}
              placeholder={t('editor.subject')}
              value={draft.subject}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setTasks((prev) => prev.map((item, i) => (i === index ? { ...item, subject: value } : item)))
              }}
            />
            <input
              className={css.planEditorInput}
              aria-label={t('editor.assignee')}
              placeholder={t('editor.assignee')}
              value={draft.assignee}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setTasks((prev) => prev.map((item, i) => (i === index ? { ...item, assignee: value } : item)))
              }}
            />
            <input
              className={css.planEditorInput}
              aria-label={t('editor.deps')}
              placeholder={t('editor.depsHint')}
              value={draft.deps}
              disabled={busy || draft.remove}
              onChange={(event) => {
                const value = event.target.value
                setTasks((prev) => prev.map((item, i) => (i === index ? { ...item, deps: value } : item)))
              }}
            />
            <button
              type='button'
              className={css.planEditorRemove}
              disabled={busy}
              onClick={() => {
                setTasks((prev) => prev.map((item, i) => (i === index ? { ...item, remove: !item.remove } : item)))
              }}
            >
              {draft.remove ? t('editor.restore') : t('editor.remove')}
            </button>
          </div>
        ))}
        <button
          type='button'
          className={css.planEditorAdd}
          disabled={busy}
          onClick={() => {
            setTasks((prev) => [...prev, {
              id: `new-${prev.length + 1}`, subject: '', assignee: '', deps: '', remove: false, isNew: true,
            }])
          }}
        >
          {t('editor.addTask')}
        </button>
      </div>

      {error !== undefined && <p className={css.planError}>{error}</p>}
      <div className={css.planEditorActions}>
        <button type='button' className={css.planApprove} disabled={busy} onClick={() => { void save() }}>
          {busy ? t('editor.saving') : t('editor.save')}
        </button>
        <button
          type='button'
          className={css.planCancel}
          disabled={busy}
          onClick={() => {
            reset()
            setOpen(false)
          }}
        >
          {t('editor.cancel')}
        </button>
      </div>
    </div>
  )
}
