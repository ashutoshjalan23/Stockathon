import { Router } from "express";

import{buy, getAllStocks, getUser, stockCreate,showTransactions, sell} from '../utils/stocks.util.js';
import { validateApiKey } from "../middleware/authorization.middleware.js";
const stocksRouter=Router();

stocksRouter.post('/',stockCreate)

stocksRouter.get('/',(req,res)=> res.send({title: "GET all stocks in the market"}));

stocksRouter.get('/allstocks',getAllStocks);

stocksRouter.get('/:id/user',getUser);

stocksRouter.post('/:id/buy',buy);

stocksRouter.post('/:id/sell',sell);

stocksRouter.get(`/transactions`,validateApiKey,showTransactions)

export default stocksRouter;