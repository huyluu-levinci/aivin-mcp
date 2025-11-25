import { server } from '../server';
import { z } from 'zod';

export function registerAddTool() {
  server.registerTool(
    'add',
    {
      title: 'Addition Tool',
      description: 'Add two numbers',
      inputSchema: { a: z.number(), b: z.number() },
      outputSchema: { result: z.number() }
    },
    async ({ a, b }) => ({
      content: [{ type: 'text', text: JSON.stringify({ result: a + b }) }],
      structuredContent: { result: a + b }
    })
  );

}