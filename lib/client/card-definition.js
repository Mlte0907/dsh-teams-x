import { TEAMSX_CARD_EVENT_TYPES, teamsXCardMatchRole, teamsXCardStart, teamsXCardUpdate, } from "./card-state.js";
/**
 * The assembler-facing definition. `update()` always returns a state object
 * (the assembler fails loud on undefined), and `buildViewNode` returns null
 * only when the window does not contain the creating event.
 */
export const teamsXCardDefinition = {
    kind: 'teamsx',
    target: 'chat',
    match: (event) => {
        if (!TEAMSX_CARD_EVENT_TYPES.includes(event.type))
            return null;
        return teamsXCardMatchRole(event.type, event.data);
    },
    start: (_context, match) => {
        if (match.event.type !== 'teamsx/team-created') {
            throw new Error('teamsx card start requires teamsx/team-created');
        }
        return teamsXCardStart(match.event.data);
    },
    update: (context, match) => (teamsXCardUpdate(context.state, match.event.type, match.event.data)),
    buildViewNode: (context) => {
        if (context.start === undefined)
            return null;
        return {
            key: context.key,
            kind: 'teamsx-card',
            id: context.id,
            target: 'chat',
            anchorSeq: context.start.event.seq,
            location: context.start.location,
            visibility: 'visible',
            data: context.state,
        };
    },
};
