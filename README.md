# Minimal MCP Server

This is a minimal Model Context Protocol (MCP) server intended as a starting point for the OpenAI Agent Builder. It listens on port `8080` by default and provides a simple `/mcp` endpoint to receive/echo MCP requests.

**Files created**

- `package.json` - project metadata and dependency
- `index.js` - the server implementation
- `Dockerfile` - buildable image (exposes `8080`)
- `mcp-manifest.json` - simple manifest you can reference

**Endpoints**

- `GET /` : SSE endpoint for Agent Builder connections
- `GET /status` : sanity response
- `GET /health` : health-check JSON
- `GET /.well-known/mcp.json` : discovery manifest
- `POST /` : MCP endpoint (echoes request body)

docker build -t minimal-mcp-server:latest .
docker run --rm -p 8080:8080 minimal-mcp-server:latest
**Run locally (Windows cmd.exe) using Node.js**

1. Install dependencies:

```cmd
cd d:\\Levinci\\levinci-mcp
npm install
```

2. Start server (binds to all interfaces so you can expose the port):

```cmd
set PORT=3000
npm start
```

Server will listen on `http://0.0.0.0:3000` and `http://localhost:3000`.

Making the server reachable externally:

- If you want the OpenAI Agent Builder to reach your local server, you need a publicly reachable URL. Options:
  - Use a tunneling service like `ngrok`:

```cmd
ngrok http 3000
```

SSE (Server-Sent Events) support

- Connect Agent Builder or any EventSource-capable client to the SSE endpoint:

```js
// Browser / Agent Builder style example
const es = new EventSource("http://<your-host>:3000/");
es.addEventListener("endpoint", (e) => {
  const data = JSON.parse(e.data);
  console.log("endpoint URL:", data.url);
});
es.addEventListener("message", (e) => {
  const payload = JSON.parse(e.data);
  console.log("message event:", payload);
});

// Keep listening for events...
```

- To send a message (e.g., from Agent Builder webhook), POST to `/`:

```cmd
curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d "{\"type\":\"message\",\"text\":\"hello\"}"
```

- If you want to target a specific SSE client, include `targetId` in the POST body (the client receives an initial `connected` event with its id):

```cmd
curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d "{\"targetId\":\"<client-id>\",\"text\":\"private\"}"
```

    - Deploy to a cloud VM and open the VM firewall for port `8080`.

- Note: binding to `0.0.0.0` (done in `index.js`) lets the process accept external connections. On Windows you may also need to allow Node through the Windows Firewall.

**Optional: run as a managed service**

- For development, add `nodemon` and run a dev script:

```cmd
npm install --save-dev nodemon
npx nodemon index.js
```

- For production on a server, consider using a process manager like `pm2`:

```cmd
npm install -g pm2
pm2 start index.js --name minimal-mcp-server
pm2 save
```

**Notes**

- This server is intentionally minimal: no auth or TLS. Use it as a local test harness or a starting point for implementing the full MCP semantics required by Agent Builder.

If you want, I can:

- Add a small OpenAPI spec for the endpoints
- Add simple API-key auth and TLS
- Implement a full MCP event handler according to a schema you provide
