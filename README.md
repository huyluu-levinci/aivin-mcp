# Aivin MCP Server

An MCP (Model Context Protocol) server for OpenAI Agent Builder that provides intelligent document querying and analysis. It specializes in reading DOCX documents, extracting hierarchical sections, scoring relevance based on queries, and returning structured results with automatic language detection for AI-guided responses. Includes basic calculation tools and supports multiple transport protocols for flexible integration.

## Features

- **DOCX Reader Tool**: Intelligently searches and extracts relevant sections from DOCX documents, with hierarchical content inclusion, relevance scoring prioritizing titles, parent-child expansion for whole-number sections, and automatic language detection to guide AI responses.
- **Addition Tool**: Performs basic arithmetic addition.
- **Multiple Transports**: Supports StreamableHTTP for request-based connections.
- **Language Detection**: Automatically detects Vietnamese or English from user input and prepends response instructions.
- **TypeScript**: Fully typed with comprehensive error handling and logging.

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

## Tools

### DOCX Reader Tool

Searches DOCX files in the `src/documents` directory for relevant sections based on a translated query. Automatically detects the language of the original user input and guides the AI response accordingly.

**Input Schema:**

```json
{
  "user_input": "string",
  "query": "string"
}
```

**Output:** Relevant document sections with titles, hierarchical content, relationships, and language guidance.

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
├── transports/         # Transport implementations (StreamableHTTP)
└── documents/          # Document storage directory
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `express` - Web framework
- `mammoth` - DOCX file processing
- `cheerio` - HTML parsing
- `zod` - Input validation

## Development Notes

- The server binds to `0.0.0.0` to accept external connections
- DOCX files should be placed in `src/documents/` directory
- Extensive logging for debugging query processing, scoring, and language detection

## License

[Add license information here]
