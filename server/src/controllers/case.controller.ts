import { Request, Response, NextFunction } from 'express';
import { CaseService } from '../services/case.service.js';

export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  createCase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicCase = await this.caseService.createCase(req.body);
      res.status(201).json({
        success: true,
        data: publicCase
      });
    } catch (err) {
      next(err);
    }
  };

  getCase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicCase = await this.caseService.getCase(req.params.caseId);
      res.status(200).json({
        success: true,
        data: publicCase
      });
    } catch (err) {
      next(err);
    }
  };

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusData = await this.caseService.getStatus(req.params.caseId);
      res.status(200).json({
        success: true,
        data: statusData
      });
    } catch (err) {
      next(err);
    }
  };

  requestHint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const level = req.body?.level !== undefined ? Number(req.body.level) : undefined;
      const hintData = await this.caseService.requestHint(req.params.caseId, level as any);
      res.status(200).json({
        success: true,
        data: hintData
      });
    } catch (err) {
      next(err);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.caseService.submitAnswer(req.params.caseId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };

  getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.caseService.getResult(req.params.caseId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
}
