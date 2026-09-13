/**
 * Single source of truth for every TeamsX icon — all SVG, zero PNG.
 *
 * Each entry is the inner markup of a 24×24 stroke icon. `icons.tsx` renders
 * these inline as React components (currentColor-themable, CSS-animatable);
 * `scripts/export-icons.mjs` wraps the same bodies into standalone
 * `assets/icons/*.svg` files for README and marketplace use. Editing a path
 * here updates both surfaces on the next build.
 * @module dsh-teams-x/client/icon-data
 */

export interface IconDefinition {
  /** Human label used by the exporter and accessibility text. */
  readonly label: string
  /** Inner SVG markup (stroke style; the shell supplies svg/attrs). */
  readonly body: string
  /** Non-default viewBox (the shared shell assumes 0 0 24 24). */
  readonly viewBox?: string
  /** Fill-based icons render `fill: currentColor` with no stroke shell. */
  readonly mode?: 'fill'
}

/** Shared stroke attributes applied by the shell to every stroke icon. */
export const ICON_STROKE = {
  width: 1.8,
  linecap: 'round',
  linejoin: 'round',
} as const

export const ICONS: Readonly<Record<string, IconDefinition>> = {
  // ── brand ──
  'teams-x-logo': {
    label: 'TeamsX',
    // Robot head — the captain's mark (user-supplied artwork, fill-based).
    mode: 'fill',
    viewBox: '0 0 1024 1024',
    body: '<path d="M329.142857 347.428571a18.285714 18.285714 0 0 1 2.139429 36.443429L329.142857 384h-36.571428a91.428571 91.428571 0 0 0-91.337143 87.460571L201.142857 475.428571v182.857143a91.428571 91.428571 0 0 0 87.460572 91.337143L292.571429 749.714286h438.857142a91.428571 91.428571 0 0 0 91.337143-87.460572L822.857143 658.285714V475.428571a91.428571 91.428571 0 0 0-87.460572-91.337142L731.428571 384h-36.571428a18.285714 18.285714 0 0 1-2.139429-36.443429L694.857143 347.428571h36.571428a128 128 0 0 1 127.926858 123.611429L859.428571 475.428571v182.857143a128 128 0 0 1-123.611428 127.926857L731.428571 786.285714H292.571429a128 128 0 0 1-127.926858-123.611428L164.571429 658.285714V475.428571a128 128 0 0 1 123.611428-127.926857L292.571429 347.428571h36.571428z m54.857143 146.285715a36.571429 36.571429 0 1 1 0 73.142857 36.571429 36.571429 0 0 1 0-73.142857z m256 0a36.571429 36.571429 0 1 1 0 73.142857 36.571429 36.571429 0 0 1 0-73.142857z m44.745143-254.061715a18.285714 18.285714 0 0 1 8.173714 24.521143C664.941714 320.128 581.924571 384 512 384s-152.941714-63.853714-180.918857-119.826286a18.285714 18.285714 0 0 1 32.694857-16.347428C386.084571 292.443429 457.581714 347.428571 512 347.428571s125.915429-55.003429 148.224-99.602285a18.285714 18.285714 0 0 1 24.521143-8.173715z"/>',
  },

  // ── member roles ──
  'role-lead': {
    label: 'Team lead',
    body: '<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"/>',
  },
  'role-researcher': {
    label: 'Researcher',
    body: [
      '<circle cx="10.5" cy="10.5" r="5.5"/>',
      '<path d="M14.7 14.7 20 20"/>',
      '<path d="M8 10.5h5"/>',
      '<path d="M10.5 8v5"/>',
    ].join(''),
  },
  'role-engineer': {
    label: 'Engineer',
    body: [
      '<path d="M14.7 6.3a4.2 4.2 0 0 0-5.6 5.6L4 17v3h3l5.1-5.1a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    ].join(''),
  },
  'role-reviewer': {
    label: 'Reviewer',
    body: [
      '<circle cx="11" cy="11" r="6.5"/>',
      '<path d="M15.8 15.8 21 21"/>',
      '<path d="m8.2 11 2 2 3.6-3.8"/>',
    ].join(''),
  },
  'role-qa': {
    label: 'QA',
    body: [
      '<path d="M12 3 4.5 6v5c0 4.6 3.2 8 7.5 9.6 4.3-1.6 7.5-5 7.5-9.6V6z"/>',
      '<path d="m9 11.6 2.1 2.1L15.3 9.5"/>',
    ].join(''),
  },
  'role-security': {
    label: 'Security',
    body: [
      '<path d="M12 3 4.5 6v5c0 4.6 3.2 8 7.5 9.6 4.3-1.6 7.5-5 7.5-9.6V6z"/>',
      '<circle cx="12" cy="10.5" r="1.9"/>',
      '<path d="M12 12.4v3.4"/>',
    ].join(''),
  },
  'role-docs': {
    label: 'Docs',
    body: [
      '<path d="M6 3h8l4 4v14H6z"/>',
      '<path d="M14 3v4h4"/>',
      '<path d="M9 12h6"/>',
      '<path d="M9 16h6"/>',
    ].join(''),
  },
  'role-designer': {
    label: 'Designer',
    body: [
      '<rect x="4" y="4" width="16" height="16" rx="2.5"/>',
      '<circle cx="9" cy="9" r="1.7"/>',
      '<path d="m4.5 17 4.5-4.5 3 3 4-4 3.5 3.5"/>',
    ].join(''),
  },
  'role-operator': {
    label: 'Operator',
    body: [
      '<circle cx="12" cy="12" r="3"/>',
      '<path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6"/>',
    ].join(''),
  },
  'role-data': {
    label: 'Data',
    body: [
      '<ellipse cx="12" cy="5.5" rx="7" ry="2.7"/>',
      '<path d="M5 5.5v13c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-13"/>',
      '<path d="M5 12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7"/>',
    ].join(''),
  },

  // ── member action states ──
  'action-working': {
    label: 'Working',
    // Wrench — pairs with a CSS "wobble" animation in the panel.
    body: '<path d="M14.7 6.3a4.2 4.2 0 0 0-5.6 5.6L4 17v3h3l5.1-5.1a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  },
  'action-thinking': {
    label: 'Thinking',
    // Head silhouette with spark dots — pairs with a CSS "blink" animation.
    body: [
      '<path d="M11 4a6.2 6.2 0 0 0-6.2 6.2c0 2.2 1.1 3.7 2.2 5 .8.9 1.2 1.9 1.2 3v.3h6.4v-.6c0-1.1.5-2 1.3-2.9A6.2 6.2 0 0 0 11 4z"/>',
      '<path d="M9.4 21.5h3.6"/>',
      '<path d="M18.5 5.5v-3M20 4h-3"/>',
    ].join(''),
  },
  'action-reporting': {
    label: 'Reporting',
    // Clipboard with check.
    body: [
      '<rect x="5.5" y="4.5" width="13" height="17" rx="2"/>',
      '<path d="M9 4.5V3h6v1.5"/>',
      '<path d="m9 13 2.1 2.1 4.2-4.2"/>',
    ].join(''),
  },
  'action-sending': {
    label: 'Sending',
    // Paper plane — pairs with a CSS "fly" animation.
    body: '<path d="M21 3 3.8 10.2l6.4 2.4 2.4 6.4z"/><path d="M21 3 10.2 12.6"/>',
  },
  'action-sleeping': {
    label: 'Sleeping',
    // Crescent moon with z's — pairs with a CSS "drift" animation.
    body: [
      '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
      '<path d="M16.5 4.5h3.5l-3.5 3.5h3.5"/>',
    ].join(''),
  },
  'action-celebrating': {
    label: 'Celebrating',
    // Party popper — pairs with a CSS "pop" animation.
    body: [
      '<path d="m5.2 12.2 6.6 6.6-7.6 2.2a1 1 0 0 1-1.2-1.2z"/>',
      '<path d="M10 8 8.5 9.5"/>',
      '<path d="M14.5 4.5c.5 2-.5 3.5-2 4"/>',
      '<path d="M19.5 9.5c-2-.5-3.5.5-4 2"/>',
      '<path d="M17.5 3.5 16 5"/>',
      '<path d="M20.5 14.5 19 16"/>',
    ].join(''),
  },
}

/** Team status icons used by the panel header and task rows. */
export const STATUS_ICONS: Readonly<Record<string, IconDefinition>> = {
  'status-open': {
    label: 'Open',
    body: '<circle cx="12" cy="12" r="8"/>',
  },
  'status-running': {
    label: 'Running',
    body: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  },
  'status-blocked': {
    label: 'Blocked',
    body: '<circle cx="12" cy="12" r="8"/><path d="M5.8 5.8l12.4 12.4"/>',
  },
  'status-completed': {
    label: 'Completed',
    body: '<circle cx="12" cy="12" r="8"/><path d="m8.2 12.2 2.6 2.6 5-5.4"/>',
  },
  'status-failed': {
    label: 'Failed',
    body: '<circle cx="12" cy="12" r="8"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>',
  },
  'status-cancelled': {
    label: 'Cancelled',
    body: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12h7"/>',
  },
}
