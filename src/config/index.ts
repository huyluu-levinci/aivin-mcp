import dotenv from 'dotenv';
dotenv.config();

export const config = {
    privateKey: process.env.MCP_PRIVATE_KEY || 'default-key',
    serverName: process.env.MCP_SERVER_NAME || 'default-server',
    tokenSecret: process.env.MCP_TOKEN_SECRET || 'supersecret',
    tokenExpiresIn: process.env.MCP_TOKEN_EXPIRES_IN || '1h',
    serverVersion: process.env.MCP_SERVER_VERSION || '0.0.1',
    port: parseInt(process.env.PORT || '3000', 10)
};