import { Router } from "express";

import {signin, getAllInvestors} from '../utils/investor.util.js';
import { signup } from "../utils/investor.util.js";
import {  validateApiKey } from "../middleware/authorization.middleware.js";

const investorRouter=Router();

investorRouter.post('/signin',signin);
investorRouter.post('/signup',validateApiKey,signup);
investorRouter.get('/all',validateApiKey,getAllInvestors);

export default investorRouter;