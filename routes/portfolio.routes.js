import { Router } from "express";
import {showPortfolio} from '../utils/portfolio.util.js'
import { authenticateToken } from "../middleware/authorization.middleware.js";

const portfolioRouter= Router();

portfolioRouter.get('/', authenticateToken,showPortfolio);


export default portfolioRouter;