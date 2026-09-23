let sessions;
/** Called once by the plugin shell with the injected sessions service. */
export function provideSessions(face) {
    sessions = face;
}
/** The provided face, or undefined on hosts where apply never ran. */
export function peekSessions() {
    return sessions;
}
