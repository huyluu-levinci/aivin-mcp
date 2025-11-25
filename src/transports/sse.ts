import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Response } from 'express';

export const createSSETransport = (res: Response) => new SSEServerTransport('/messages', res);