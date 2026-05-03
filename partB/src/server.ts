import app from './app';
import { closeDb } from './utils/db.util';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`[server] Mini Library API running on http://localhost:${PORT}`);
  console.log(`[server] Swagger UI: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});

export default server;
