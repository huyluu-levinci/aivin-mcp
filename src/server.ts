import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createStreamableTransport } from './transports/streamableHttp';
import { createSSETransport } from './transports/sse';
import { config } from './config';
import { registerAllTool } from './tools/index';

export const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion
});

registerAllTool();

const app = express();
app.use(express.json());

const sseTransports: Record<string, any> = {};

// StreamableHTTP endpoint
app.post('/mcp', async (req, res) => {
    const transport = createStreamableTransport();

    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

// SSE endpoint
app.get('/sse', (req, res) => {
    const transport = createSSETransport(res);
    sseTransports[transport.sessionId] = transport;

    res.on('close', () => delete sseTransports[transport.sessionId]);
    server.connect(transport);
});

// Legacy messages
app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = sseTransports[sessionId];
    if (transport) await transport.handlePostMessage(req, res, req.body);
    else res.status(400).send('No transport found for sessionId');
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => console.log(`MCP Server running on http://localhost:${port}/mcp`));