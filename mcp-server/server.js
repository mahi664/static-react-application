import { createServer } from '@microsoft/model-context-protocol';
import express from 'express';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Create WebSocket server
const wsServer = new WebSocketServer({ port: 3001 });

// Create MCP server
const mcpServer = createServer({
  webSocketServer: wsServer,
  onConnect: (connection) => {
    console.log('Chrome DevTools connected');
    
    // Monitor CSS changes
    connection.on('message', (message) => {
      if (message.type === 'css-update') {
        console.log('CSS Update detected:', message.data);
      }
    });
  }
});

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// Start the server
app.listen(port, () => {
  console.log(`MCP Server running at http://localhost:${port}`);
  console.log(`WebSocket server running at ws://localhost:3001`);
});