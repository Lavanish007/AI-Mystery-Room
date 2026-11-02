import { Router } from 'express';
import { CaseController } from '../controllers/case.controller.js';

export function createCaseRouter(controller: CaseController): Router {
  const router = Router();

  router.post('/cases', controller.createCase);
  router.get('/cases/:caseId', controller.getCase);
  router.get('/cases/:caseId/status', controller.getStatus);
  router.post('/cases/:caseId/hints', controller.requestHint);
  router.post('/cases/:caseId/answer', controller.submitAnswer);
  router.get('/cases/:caseId/result', controller.getResult);

  return router;
}
