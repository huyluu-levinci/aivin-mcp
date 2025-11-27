# Aivin MCP Server

A Model Context Protocol (MCP) server designed for OpenAI Agent Builder, providing tools for document processing and basic calculations. Built with TypeScript and Express, featuring both SSE and StreamableHTTP transports.

## Features

- **DOCX Reader Tool**: Extract and search relevant sections from DOCX documents
- **Addition Tool**: Perform basic arithmetic operations
- **Multiple Transports**: Support for both Server-Sent Events (SSE) and StreamableHTTP
- **TypeScript**: Full TypeScript support with type safety

## Installation

1. Clone the repository:

```bash
git clone https://github.com/huyluu-levinci/aivin-mcp.git
cd aivin-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
MCP_SERVER_NAME=aivin-mcp-server
MCP_SERVER_VERSION=0.1.0
PORT=3000
```

## Usage

### Development

Start the development server with hot reload:

```bash
npm run dev
```

### Production

Build and start the server:

```bash
npm run build
npm start
```

The server will listen on `http://localhost:3000` by default.

## API Endpoints

- `POST /mcp` - StreamableHTTP MCP endpoint
- `GET /sse` - Server-Sent Events endpoint for real-time connections
- `POST /messages?sessionId=<id>` - Send messages to specific SSE sessions

## Tools

### DOCX Reader Tool

Reads and searches DOCX files in the `src/documents` directory.

**Input Schema:**

```json
{
  "query": "string"
}
```

**Output:** Relevant document sections with titles, content, and relationships.

### Addition Tool

Performs addition of two numbers.

**Input Schema:**

```json
{
  "a": "number",
  "b": "number"
}
```

**Output:**

```json
{
  "result": "number"
}
```

## Making the Server Externally Accessible

For OpenAI Agent Builder to connect, expose the server externally:

### Using ngrok

```bash
ngrok http 3000
```

### Using Cloud Deployment

Deploy to a cloud VM and configure firewall to allow port 3000.

## Project Structure

```
src/
├── server.ts          # Main server implementation
├── config/             # Configuration management
├── tools/              # MCP tools (add, docx-reader)
├── transports/         # Transport implementations (SSE, StreamableHTTP)
└── documents/          # Document storage directory
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `express` - Web framework
- `mammoth` - DOCX file processing
- `cheerio` - HTML parsing

## Development Notes

- The server binds to `0.0.0.0` to accept external connections
- DOCX files should be placed in `src/documents/` directory
- SSE connections support session-based messaging

## License

[Add license information here]
