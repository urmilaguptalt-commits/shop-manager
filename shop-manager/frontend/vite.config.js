import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const mockApiPlugin = () => {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Strip trailing slash if any to match path parsing in serverless handler
        const requestUrl = req.url.split('?')[0];
        if (req.url.startsWith('/api/') || req.url === '/api') {
          try {
            const apiPath = path.resolve(__dirname, 'netlify/functions/api.js');
            // Clear require cache to allow data changes to refresh in dev mode
            delete require.cache[require.resolve(apiPath)];
            const { handler } = require(apiPath);

            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', async () => {
              const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const event = {
                httpMethod: req.method,
                path: urlObj.pathname,
                body: body,
                headers: req.headers,
                queryStringParameters: Object.fromEntries(urlObj.searchParams.entries())
              };

              const result = await handler(event, {});

              res.statusCode = result.statusCode;
              for (const [key, val] of Object.entries(result.headers || {})) {
                res.setHeader(key, val);
              }
              res.end(result.body);
            });
          } catch (err) {
            console.error('Vite Mock API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ detail: err.message }));
          }
        } else {
          next();
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
})
