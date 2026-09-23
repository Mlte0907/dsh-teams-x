import type { ReactElement } from 'react';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
import type { Translate } from './format.ts';
/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void;
export interface TeamCardProps {
    readonly team: TeamActivitySnapshot;
    readonly t: Translate;
    readonly openMember: OpenMember;
    readonly readOnly?: boolean;
    /** Called after a staged-plan edit batch commits, to refresh immediately. */
    readonly onSaved: () => void;
}
export declare function TeamCard({ team, t, openMember, readOnly, onSaved }: TeamCardProps): ReactElement;
