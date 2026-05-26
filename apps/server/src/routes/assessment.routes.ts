import { Router } from 'express';
import { assessmentController } from '@/controllers/assessment.controller';
import { validate } from '@/middleware/validate';
import { CreateAssessmentSchema } from '@/validators/assessment.validator';

export const assessmentRouter = Router();

assessmentRouter.get('/', assessmentController.getAll);
assessmentRouter.get('/:id', assessmentController.getById);
assessmentRouter.get('/:id/download', assessmentController.download);
assessmentRouter.post('/', validate(CreateAssessmentSchema), assessmentController.create);
assessmentRouter.post('/:id/regenerate', assessmentController.regenerate);
assessmentRouter.delete('/:id', assessmentController.delete);

export default assessmentRouter;
