import { Router } from 'express';
import { registrationController, registrationSchema } from '../controllers/registration.controller';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

// GET /api/registration/status
router.get('/status', registrationController.getRegistrationStatus);

// POST /api/registration/initiate
router.post('/initiate', validateBody(registrationSchema), registrationController.initiate);

// GET /api/registration/status/:reference
router.get('/status/:reference', registrationController.getStatus);

export default router;
