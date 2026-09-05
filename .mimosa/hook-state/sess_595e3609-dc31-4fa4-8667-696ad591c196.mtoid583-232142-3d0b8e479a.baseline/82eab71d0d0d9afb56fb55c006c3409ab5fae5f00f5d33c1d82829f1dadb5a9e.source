import type { IncomingMessage, ServerResponse } from 'node:http';
import type { HostConnectionService } from '@deepseek-ai/dsh-client-connection';
/** Public WebServer route surface used by the plugin. */
export interface WebRouteHost {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    }): () => void;
}
export type BrowserRequestGate = Pick<HostConnectionService, 'requestRejection'>;
/**
 * Raw WebServer routes do not inherit Connection's authentication fence, so
 * every route wraps the handler with an explicit gate. Missing/disposing
 * Connection is an assembly failure, never an invitation to expose workspace
 * state or accept plan mutations.
 */
export declare function authenticatedWebRoutes(server: WebRouteHost, connection: () => BrowserRequestGate | undefined): WebRouteHost;
