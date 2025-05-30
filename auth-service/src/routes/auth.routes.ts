import { Router} from 'express';
import { logInController, signUpController } from '../controllers/user.controller';


const router = Router();

router.post('/signup', signUpController);

router.post('/login', logInController);

export default router;