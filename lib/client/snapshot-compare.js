/**
 * Deep equality over plain JSON data (objects, arrays, primitives). Snapshot
 * payloads arrive from `JSON.parse`, so prototypes are `Object.prototype` and
 * `undefined`-valued keys are impossible — key-set equality is sound.
 */
function sameValue(a, b) {
    if (a === b)
        return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null)
        return false;
    const arrayA = Array.isArray(a);
    if (arrayA !== Array.isArray(b))
        return false;
    if (arrayA) {
        if (a.length !== b.length)
            return false;
        return a.every((item, index) => sameValue(item, b[index]));
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
        return false;
    return keysA.every((key) => (Object.prototype.hasOwnProperty.call(b, key)
        && sameValue(a[key], b[key])));
}
/**
 * True when both poll results would render identically. Snapshot arrays are
 * compared position-by-position; the assembler emits a stable order, so a
 * reordered roster is a real change worth re-rendering.
 */
export function sameTeamsSnapshots(a, b) {
    if (a === b)
        return true;
    if (a.length !== b.length)
        return false;
    return a.every((team, index) => sameValue(team, b[index]));
}
