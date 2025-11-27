import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createStreamableTransport } from './transports/streamableHttp';
import { config } from './config';
import { registerAllTool } from './tools/index';

export const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion
});

registerAllTool();

const app = express();
app.use(express.json());

// StreamableHTTP endpoint
app.post('/mcp', async (req, res) => {
    const transport = createStreamableTransport();

    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => console.log(`MCP Server running on http://localhost:${port}/mcp`));