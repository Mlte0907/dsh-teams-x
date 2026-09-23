/** Interpolate `{key}` params into a locale string. */
export function format(template, params) {
    if (params === undefined)
        return template;
    return template.replace(/\{(\w+)\}/gu, (match, key) => (Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match));
}
/** Wrap the harness translate function with interpolation. */
export function makeT(t) {
    return (key, params) => format(t(key, params), params);
}
/** Compact token formatter: 1234 → 1.2k, 45600 → 45.6k. */
export function formatTokens(n) {
    if (n < 1000)
        return String(n);
    if (n < 1_000_000)
        return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
    return `${(n / 1_000_000).toFixed(1)}M`;
}
/** Humanize a millisecond duration for the task-age badge. */
export function formatElapsed(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60)
        return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    if (minutes < 60)
        return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours < 24)
        return rest === 0 ? `${hours}h` : `${hours}h${rest}m`;
    return `${Math.floor(hours / 24)}d${hours % 24}h`;
}
