import { Router } from "express";

import {signin} from '../utils/investor.util.js';
import { signup } from "../utils/investor.util.js";
import { authenticateToken } from "../middleware/authorization.middleware.js";

const investorRouter=Router();

investorRouter.get('/signin',authenticateToken,signin);
investorRouter.post('/signup',signup);

export default investorRouter;