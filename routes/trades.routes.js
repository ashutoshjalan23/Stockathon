// routes/trade.js
import {Router} from 'express';
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Transaction from "../models/transaction.model.js";
import { updatePrice } from "../utils/pricing.util.js";
import Investors from '../models/investor.model.js';
import Stocks from '../models/stock.model.js';

const tradesRouter= Router();

//API FOR BUYING

tradesRouter.post("/buy", async (req, res) => {
  const { investorId, startupId, shares} = req.body;

  const investor = await Investors.findById(investorId);
  const startup = await Company.findById(startupId);
  

  const cost = shares * startup.pricePerShare;
  if (investor.balance < cost) return res.status(400).json({ error: "Insufficient funds" });

  investor.balance -= cost;
  startup.investors.push({ investor: investor._id, sharesOwned: shares });
  Stocks.Owners.push({investor:investor._id});
  updatePrice(startup, shares);

  await investor.save();  
  await startup.save();

  const txn = await Transaction.create({
    investor: investor._id,
    startup: startup._id,
    type: "BUY",
    shares,
    pricePerShare: startup.pricePerShare
  });

  res.json({ message: "Purchase successful", txn });
});


//API FOR SELLING


tradesRouter.post("/sell", async (req,res)=>{

    const{investorId,startupId,shares}=req.body;

    const investor = await User.findById(investorId);
    const startup = await Company.findById(startupId);
// Checking if investor even owns these shares

        const startupIDs= investor.portoflio.map(item => item.startup);

        if(startup._id in startupIDs){

       startup.shares+=shares

    const cost= -(shares * startup.pricePerShare);  // declaring with minus sign so that pricing util has not to seperately defined for selling
    
    investor.balance-=cost;
    updatePrice(startup,shares);

    await investor.save();
    await startup.save();

  const txn = await Transaction.create({
    investor: investor._id,
    startup: startup._id,
    type: "SELL",
    shares,
    pricePerShare: startup.pricePerShare
  });

   res.json({ message: "Purchase successful", txn });}

   else{

    res.send("Invalid transaction");
   };

});

export default tradesRouter;
