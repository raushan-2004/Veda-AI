import type { Request, Response, NextFunction } from 'express';
import { assessmentService } from '@/services/assessment.service';
import { pdfService } from '@/services/pdf.service';
import fs from 'fs';
import path from 'path';

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

  public regenerate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const retriggered = await assessmentService.regenerate(id);

      res.status(200).json({
        success: true,
        message: 'AI Assessment generation re-scheduled successfully',
        data: retriggered,
      });
    } catch (error) {
      next(error);
    }
  };

  public download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const filePath = path.join(__dirname, '../../temp/pdfs', `${id}.pdf`);

      // Failsafe dynamic compile fallback
      if (!fs.existsSync(filePath)) {
        const assessment = await assessmentService.getById(id);
        if (!assessment) {
          res.status(404).json({ success: false, message: 'Assessment not found' });
          return;
        }
        await pdfService.generateAssessmentPDF(assessment);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="assessment_${id}.pdf"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}

export const assessmentController = new AssessmentController();
export default assessmentController;
