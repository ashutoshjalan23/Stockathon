import { Router } from "express";

import {signin} from '../utils/investor.util.js';
import { signup } from "../utils/investor.util.js";
import {  validateApiKey } from "../middleware/authorization.middleware.js";

const investorRouter=Router();

investorRouter.post('/signin',signin);
investorRouter.post('/signup',validateApiKey,signup);

export default investorRouter;