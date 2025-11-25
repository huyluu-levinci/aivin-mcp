import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export const createStreamableTransport = () =>
  new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });