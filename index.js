import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

// 1. Function to create MCP server instance
const getServer = () => {
  const server = new McpServer({
    name: "minimal-mcp",
    version: "1.0.0",
  });

  server.tool("ping", {}, async () => {
    return {
      content: [{ type: "text", text: "pong" }],
    };
  });

  return server;
};

// Store transports by session ID
const transports = {};

// 2. Handle all requests on root "/"
app.all("/", async (req, res) => {
  console.log(`Received ${req.method} request to /`);

  // Check for existing session ID
  const sessionId = req.headers["mcp-session-id"];

  let transport;
  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && req.method === "POST") {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => require("crypto").randomUUID(),
      onsessioninitialized: (sid) => {
        console.log(`Session initialized with ID: ${sid}`);
        transports[sid] = transport;
      },
    });

    // Set up onclose handler
    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid && transports[sid]) {
        console.log(`Transport closed for session ${sid}`);
        delete transports[sid];
      }
    };

    // Connect the transport to the MCP server
    const server = getServer();
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: null,
    });
    return;
  }

  // Handle the request with the transport
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
});
