# Aivin MCP Server

An MCP (Model Context Protocol) server for OpenAI Agent Builder that provides intelligent document querying and analysis. It specializes in reading DOCX documents, extracting hierarchical sections, scoring relevance based on queries, and returning structured results with automatic language detection for AI-guided responses. Includes basic calculation tools and supports multiple transport protocols for flexible integration.

## Features

- **DOCX Reader Tool**: Intelligently searches and extracts relevant sections from DOCX documents, with hierarchical content inclusion, relevance scoring prioritizing titles, parent-child expansion for whole-number sections, and automatic language detection to guide AI responses.
- **Addition Tool**: Performs basic arithmetic addition.
- **Multiple Transports**: Supports StreamableHTTP for request-based connections.
- **Language Detection**: Automatically detects Vietnamese or English from user input and prepends response instructions.
- **TypeScript**: Fully typed with comprehensive error handling and logging.

## Document Upload Viability

The DOCX Reader tool supports processing large documents, including those with 2,000+ lines.

- **Feasibility**: Yes, documents up to 2k lines (roughly 10-20 pages) process normally without issues. The tool converts DOCX to HTML, extracts sections, scores relevance, and builds responses efficiently.
- **Performance**: Processing time is seconds on modern hardware; memory usage stays within Node.js limits.
- **Limitations**:
  - Very large documents (e.g., 10k+ lines) may slow scoring or increase response size.
  - Response strings can grow large for verbose content—consider chunking if needed.
  - No hard file size limits, but test with your documents.
- **Recommendations**:
  - Place files in `src/documents/` for access.
  - For massive docs, optimize by focusing queries on specific sections.
  - Monitor logs for performance insights.

## Learning New Coding Languages with AI

This section discusses how AI systems (LLMs or specialized agents) can learn new programming languages, based on the capabilities of systems like this MCP server.

### LLM vs. Agent Approaches for Learning

AI systems can learn new coding languages through different mechanisms. Here's how LLMs and agents compare in their ability to acquire and apply knowledge of new languages:

#### Using an LLM (e.g., Grok or Similar Models)

- **Viability**: Excellent; LLMs are highly adaptable for learning new languages on the fly.
- **Advantages**:
  - Conversational learning: Can "learn" syntax, patterns, and best practices through user-provided examples or explanations.
  - Instant generation: Produces code in new languages immediately after learning basics.
  - Broad adaptability: Handles any language from training data or inferred patterns.
- **Best For**: Rapid prototyping, code generation, and debugging in unfamiliar languages.
- **Limitations**: Learning is session-based; may require reinforcement for complex languages.
- **How It Learns**: Through pattern recognition in conversations—provide code snippets, rules, or examples, and the LLM adapts.

#### Using a Specialized Agent (e.g., This MCP Server)

- **Viability**: Limited; agents are task-focused and require explicit modifications to "learn" new languages.
- **Advantages**:
  - Reliable execution: Once integrated, agents can process or generate code in new languages consistently.
  - Extensibility: Add language support via code changes, plugins, or API integrations.
  - Specialized focus: Excels in applying learned languages to specific workflows (e.g., document processing).
- **Best For**: Production deployment of language-specific features or tools.
- **Limitations**: Cannot learn spontaneously; requires developer intervention to update code or configurations.
- **How It Learns**: Through code modifications—e.g., adding parsers, compilers, or libraries for the new language.

**Recommendation**: LLMs are superior for the AI itself to learn new languages quickly via interaction, while agents benefit from LLM-assisted development to incorporate those languages. For instance, use an LLM to prototype in a new language, then integrate it into an agent like this server.

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
