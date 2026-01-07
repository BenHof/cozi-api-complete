# Examples

This directory contains example code demonstrating how to use the Cozi API Client.

## Running Examples

### Prerequisites

Set your Cozi credentials as environment variables:

```bash
export COZI_USERNAME="your@email.com"
export COZI_PASSWORD="your-password"
```

### TypeScript Examples

Run TypeScript examples directly using `ts-node`:

```bash
# Install ts-node if you haven't already
npm install -g ts-node

# Run basic usage example
ts-node examples/basic-usage.ts

# Run session management example
ts-node examples/session-management.ts
```

### JavaScript Examples

First, compile the examples:

```bash
npx tsc examples/*.ts --outDir examples/dist
```

Then run them:

```bash
node examples/dist/basic-usage.js
node examples/dist/session-management.js
```

## Available Examples

### basic-usage.ts

Demonstrates:
- Authentication
- Fetching all lists
- Creating a new list
- Adding items to a list
- Marking items as complete
- Editing items
- Removing items

### session-management.ts

Demonstrates:
- Storing authentication tokens
- Restoring sessions from stored tokens
- Session expiration handling
- Avoiding unnecessary re-authentication

## Notes

- The session management example stores tokens in `.cozi-session.json` (this file is gitignored)
- Always handle authentication errors gracefully
- Be mindful of API rate limits
- Remember this is an unofficial API - use responsibly
