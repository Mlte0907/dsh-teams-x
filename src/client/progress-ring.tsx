/**
 * Team progress instrument: a 24px SVG donut whose arc segments are the
 * task-status distribution (six states grouped into four; cancelled tasks are
 * excluded from the denominator so the ring always closes). The number beside
 * it carries the primary reading — the ring is the at-a-glance shape.
 * @module dsh-teams-x/client/progress-ring
 */
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import css from './ActivityPanel.module.css'

export interface TaskCounts {
  readonly completed: number
  readonly running: number
  readonly failed: number
  readonly open: number
  readonly cancelled: number
  /** Denominator for progress: total minus cancelled. */
  readonly denom: number
}

/** Group the six task statuses into the ring's four segments. */
export function countTasks(tasks: TeamActivitySnapshot['tasks']): TaskCounts {
  const counts = { completed: 0, running: 0, failed: 0, open: 0, cancelled: 0 }
  for (const task of tasks) {
    if (task.status === 'cancelled') { counts.cancelled += 1; continue }
    if (task.status === 'completed') { counts.completed += 1; continue }
    if (task.status === 'in_progress' || task.status === 'claimed') { counts.running += 1; continue }
    if (task.status === 'failed') { counts.failed += 1; continue }
    counts.open += 1
  }
  const denom = tasks.length - counts.cancelled
  return { ...counts, denom }
}

interface ArcSpec {
  readonly color: string
  readonly length: number
}

export function ProgressRing({ tasks, size = 72, ok, accent, bad, track, centerValue, centerLabel }: {
  tasks: TeamActivitySnapshot['tasks']
  size?: number
  /** Segment colors (CSS color strings from the --tx-* tokens). */
  readonly ok: string
  readonly accent: string
  readonly bad: string
  readonly track: string
  /** Big center reading (e.g. "2/4"), Token-Stats-donut style. */
  readonly centerValue: string
  /** Small caption under the center value. */
  readonly centerLabel: string
}): ReactElement {
  const counts = countTasks(tasks)
  const stroke = 7
  const r = (size - stroke) / 2 - 1
  const c = 2 * Math.PI * r
  const arcs: ArcSpec[] = counts.denom === 0 ? [] : [
    { color: ok, length: (counts.completed / counts.denom) * c },
    { color: accent, length: (counts.running / counts.denom) * c },
    { color: bad, length: (counts.failed / counts.denom) * c },
  ]
  let offset = 0
  return (
    <svg
      className={css.ringSvg}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role='img'
      aria-label={`${centerValue} ${centerLabel}`}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {/* open-segment track */}
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill='none' />
        {arcs.map((arc, index) => {
          if (arc.length <= 0) return null
          const dashOffset = -offset
          offset += arc.length
          return (
            <circle
              key={index}
              className={css.ringSeg}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={arc.color}
              strokeWidth={stroke}
              fill='none'
              strokeDasharray={`${arc.length} ${c - arc.length}`}
              strokeDashoffset={dashOffset}
            />
          )
        })}
      </g>
      <text
        className={css.ringCenterValue}
        x={size / 2}
        y={size / 2 + 1}
        textAnchor='middle'
        dominantBaseline='middle'
      >
        {centerValue}
      </text>
      <text
        className={css.ringCenterLabel}
        x={size / 2}
        y={size / 2 + 14}
        textAnchor='middle'
      >
        {centerLabel}
      </text>
    </svg>
  )
}
