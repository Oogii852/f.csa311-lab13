import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import bookRoutes from './routes/book.routes';
import memberRoutes from './routes/member.routes';
import loanRoutes from './routes/loan.routes';
import statsRoutes from './routes/stats.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger / OpenAPI
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Library API',
      version: '1.0.0',
      description: 'Номын сангийн удирдлагын REST API — F.CSM311 Бие даалт 13',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/routes/*.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global error handler
app.use(errorMiddleware);

export default app;
