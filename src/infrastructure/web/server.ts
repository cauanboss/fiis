import { ExpressAdapter } from '../adapters/express-adapter.js';
import { WebServer } from './web-server.js';

const port = parseInt(process.env.PORT || '3000');

// Create Express adapter and WebServer
const expressAdapter = new ExpressAdapter();
const webServer = new WebServer(expressAdapter);

// Start the server
webServer.start(port); 