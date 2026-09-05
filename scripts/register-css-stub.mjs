/** Register the CSS-module stub loader for the client smoke test. */
import { register } from 'node:module'
register('./css-stub-loader.mjs', import.meta.url)
