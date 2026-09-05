/**
 * `teamsX` namespace dictionaries for the TeamsX activity panel.
 * The Simplified Chinese dictionary is the key-set source of truth.
 * @module dsh-teams-x/client/locales
 */
/** Dictionary namespace owned by the TeamsX client plugin. */
export declare const TEAMSX_LOCALE_NAMESPACE = "teamsX";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    'panel.aria': string;
    'panel.title': string;
    'panel.empty': string;
    'panel.refresh': string;
    'panel.close': string;
    'panel.live': string;
    'panel.archived': string;
    'panel.error': string;
    'team.phase.staged': string;
    'team.phase.running': string;
    'team.halted': string;
    'team.planReview.awaiting_review': string;
    'team.planReview.awaiting_feedback': string;
    'team.members': string;
    'team.tasks': string;
    'team.done': string;
    'team.stop': string;
    'team.stopConfirm': string;
    'team.stopCancel': string;
    'team.stopTitle': string;
    'team.stopDescription': string;
    'team.stopping': string;
    'team.stopFailed': string;
    'format.listSeparator': string;
    'member.state.idle': string;
    'member.state.working': string;
    'member.state.removed': string;
    'member.state.unknown': string;
    'member.state.unspawned': string;
    'member.unread': string;
    'member.progress': string;
    'member.pause': string;
    'task.status.pending': string;
    'task.status.claimed': string;
    'task.status.in_progress': string;
    'task.status.completed': string;
    'task.status.failed': string;
    'task.status.cancelled': string;
    'task.visual.blocked': string;
    'task.visual.open': string;
    'task.visual.running': string;
    'task.visual.completed': string;
    'task.visual.failed': string;
    'task.visual.cancelled': string;
    'task.kind.work': string;
    'task.kind.requirements': string;
    'task.kind.implementation': string;
    'task.kind.verification': string;
    'task.kind.review': string;
    'task.kind.repair': string;
    'task.kind.integration': string;
    'task.assignee.shared': string;
    'task.assignee.captain': string;
    'task.depth': string;
    'inbox.title': string;
    'inbox.empty': string;
    'inbox.more': string;
    'role.lead': string;
    'role.researcher': string;
    'role.engineer': string;
    'role.reviewer': string;
    'role.qa': string;
    'role.security': string;
    'role.docs': string;
    'role.designer': string;
    'role.operator': string;
    'role.data': string;
};
/** Locale keys are derived from the zh dictionary so a missing key is a compile error in en. */
export type TeamsXLocaleKey = keyof typeof zh;
/** English dictionary. */
export declare const en: Record<TeamsXLocaleKey, string>;
