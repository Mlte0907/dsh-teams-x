/**
 * Raw WebServer routes do not inherit Connection's authentication fence, so
 * every route wraps the handler with an explicit gate. Missing/disposing
 * Connection is an assembly failure, never an invitation to expose workspace
 * state or accept plan mutations.
 */
export function authenticatedWebRoutes(server, connection) {
    return {
        register(route) {
            return server.register({
                ...route,
                async handler(req, res) {
                    const gate = connection();
                    const rejection = gate === undefined ? 503 : gate.requestRejection(req);
                    if (rejection !== undefined) {
                        res.writeHead(rejection, {
                            'content-type': 'application/json; charset=utf-8',
                            'cache-control': 'no-store',
                        });
                        res.end(JSON.stringify({ error: rejection === 503 ? 'authentication unavailable'
                                : rejection === 401 ? 'unauthorized' : 'forbidden' }));
                        return;
                    }
                    await route.handler(req, res);
                },
            });
        },
    };
}
