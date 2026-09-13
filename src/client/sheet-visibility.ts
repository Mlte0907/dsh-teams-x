/**
 * Narrow-viewport coordination between the panel hosts. On a phone the
 * right-Sidebar pane and the badge's bottom sheet can both be mounted; when
 * the sheet is open the tab body hides itself — two copies of the same team
 * card stacked on a 390px screen read as a rendering bug (seen in browser
 * acceptance 2026-09-13).
 * @module dsh-teams-x/client/sheet-visibility
 */

type Listener = (open: boolean) => void

const listeners = new Set<Listener>()
let sheetOpen = false

/** Publish the badge sheet's open state (narrow viewports only matter). */
export function setSheetOpen(open: boolean): void {
  if (sheetOpen === open) return
  sheetOpen = open
  for (const listener of listeners) listener(open)
}

/** Subscribe to the badge sheet's open state; returns the unsubscriber. */
export function onSheetOpen(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Current state (used to initialize subscribers without a missed frame). */
export function isSheetOpen(): boolean {
  return sheetOpen
}
