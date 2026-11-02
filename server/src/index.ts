import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { CaseRepository } from './types/repository.js';
import { InMemoryCaseRepository } from './repositories/inMemoryCase.repository.js';
import { MongoCaseRepository } from './repositories/mongoCase.repository.js';
import { CaseService } from './services/case.service.js';
import { CaseController } from './controllers/case.controller.js';
import { createCaseRouter } from './routes/case.routes.js';
import { AppError } from './errors/appError.js';
import { GeminiAiProvider } from './ai/geminiProvider.js';
import { CaseGeneratorPipeline } from './ai/generatorPipeline.js';

export function createApp(
  repoOverride?: CaseRepository,
  aiPipelineOverride?: CaseGeneratorPipeline
): { app: Express; repository: CaseRepository; caseService: CaseService } {
  const repository = repoOverride || new InMemoryCaseRepository();
  const pipeline =
    aiPipelineOverride !== undefined
      ? aiPipelineOverride
      : env.GEMINI_API_KEY
      ? new CaseGeneratorPipeline(new GeminiAiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL))
      : undefined;

  const caseService = new CaseService(repository, pipeline);
  const caseController = new CaseController(caseService);

  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // Health Check
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV
      }
    });
  });

  // Mount Case Router
  app.use('/api/v1', createCaseRouter(caseController));

  // Central 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found on this server'
      }
    });
  });

  // Central error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          fieldErrors: err.fieldErrors
        }
      });
      return;
    }

    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred'
      }
    });
  });

  return { app, repository, caseService };
}

// Default application instance
const { app, repository: defaultRepository, caseService: defaultCaseService } = createApp();

const isTest =
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('test') || arg.includes('--test'));

if (!isTest) {
  // Attempt MongoDB connection if configured
  if (env.MONGODB_URI) {
    mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
      .then(() => {
        console.log('[AI Mystery Room API] Connected to MongoDB persistence layer');
      })
      .catch((err) => {
        console.warn('[AI Mystery Room API] MongoDB connection offline or unavailable, running with in-memory persistence:', err.message);
      });
  }

  app.listen(env.PORT, () => {
    console.log(`[AI Mystery Room API] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

export { app, defaultRepository, defaultCaseService };
