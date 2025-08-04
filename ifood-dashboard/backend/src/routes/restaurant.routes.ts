import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, RestaurantController.create);

export default router;