import type { Request, Response, NextFunction } from 'express';
import { assessmentService } from '@/services/assessment.service';

export class AssessmentController {
  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assessments = await assessmentService.getAll();
      res.status(200).json({
        success: true,
        data: assessments,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const assessment = await assessmentService.getById(id);
      res.status(200).json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = 'user_admin_id'; // Mock user session context
      const newAssessment = await assessmentService.create(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'AI Assessment generation pipeline scheduled successfully',
        data: newAssessment,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const assessmentController = new AssessmentController();
export default assessmentController;
