import { Router } from "express";

import { companyCreator, companySignin } from "../utils/company.util.js";
import { authenticateToken, validateApiKey } from "../middleware/authorization.middleware.js";


const companyRouter= Router();

companyRouter.post('/signup',validateApiKey,companyCreator);
companyRouter.get('/signin',companySignin)
companyRouter.get('/companyPortfolio',authenticateToken,)


export default companyRouter;