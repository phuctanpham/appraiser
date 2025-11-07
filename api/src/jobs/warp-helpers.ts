import { Context } from 'hono';

// Helper for GET requests to the warp service
export const createGetWarpJob = (path: string) => {
  return async (c: Context) => {
    const warpServiceUrl = c.env.WARP_SERVICE_URL;

    // Substitute path parameters
    let targetPath = path;
    const params = c.req.param();
    Object.keys(params).forEach(p => {
        targetPath = targetPath.replace(`:${p}`, params[p]);
    });

    const targetUrl = new URL(`${warpServiceUrl}${targetPath}`);
    targetUrl.search = new URL(c.req.url).search; // Forward query params

    const res = await fetch(targetUrl.toString(), { method: 'GET' });
    
    return c.json(await res.json(), res.status);
  }
}

// Helper for POST requests (JSON) to the warp service, injecting the userId
export const createPostWarpJob = (path: string) => {
    return async (c: Context) => {
        const userId = c.get('userId');
        const warpServiceUrl = c.env.WARP_SERVICE_URL;
        const targetUrl = new URL(`${warpServiceUrl}${path}`);

        const originalBody = await c.req.json();
        const body = JSON.stringify({
            ...originalBody,
            _userId: userId, // Inject userId for downstream services
        });

        const res = await fetch(targetUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        return c.json(await res.json(), res.status);
    }
}
