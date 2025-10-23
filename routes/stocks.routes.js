import { Router } from "express";

import{buy, getAllStocks, getUser, stockCreate,showTransactions, sell, signin} from '../utils/stocks.util.js';
import { authenticateToken, validateApiKey } from "../middleware/authorization.middleware.js";
const stocksRouter=Router();

stocksRouter.post('/',validateApiKey,stockCreate);

stocksRouter.get('/signin',signin);

stocksRouter.get('/allstocks',getAllStocks); //for everyone to view how stocks are doing

stocksRouter.get('/:id/user',authenticateToken,getUser);

stocksRouter.post('/:id/buy',authenticateToken,buy);

stocksRouter.post('/:id/sell',authenticateToken,sell);

stocksRouter.get(`/transactions`,validateApiKey,showTransactions) // only for admin user

export default stocksRouter;