import mongoose from "mongoose";
import Stocks from "../models/stock.model.js";
import Investors from "../models/investor.model.js";
import Transaction from "../models/transaction.model.js";
import bcrypt from "bcryptjs";
import { updatePrice } from "./pricing.util.js";
import { hashedPassword } from "./password.util.js";
import { generateToken } from "./jwt.util.js";

export const stockCreate= async (req,res,next) =>{


const Session= await mongoose.startSession();

try{

Session.startTransaction();

const {name,password}= req.body;

const existingStock= await Stocks.findOne({name}).session(Session);

if(existingStock){

    const err= new Error('user alread exists');
    err.status=409;
    throw err;
}
    const hashed=await hashedPassword(password);
    
    const newStock= await Stocks.create([{name:name,password:hashed}], {Session});

   res.status('201').json({
     stocks: newStock[0] , 
   
    });
 

    await Session.commitTransaction();
    Session.endSession();
   

 


}
catch(error){
  Session.endSession(); 
  next(error);
}
};

export const getAllStocks= async(req,res) => {

    const allStocks=await Stocks.find().select('-_id');

    if(allStocks){
        res.status('200').json({
            stocks:allStocks
        });
    }
    else{
        res.status('404').send("Stocks not found");

    }

};



export const signin= async(req,res)=>{

    const session= await mongoose.startSession();
    try{
        session.startTransaction();
        const{name,password}=req.body;

        const stock= await Stocks.findOne({name});
        if(stock){
            if(await bcrypt.compare(password,stock.password)){
                const txn= await generateToken(stock._id);

                await session.commitTransaction();
                session.endSession();


                res.status(201).json({
                    message:"Login successful",
                    token:txn,
                    stock:stock
                })
            }
        }
    }catch(error){
        console.error(error);
        res.status(300).json({message:"Error has occured"});
    }
};



/*export const buy = async (req, res, next) => {
    const session = await mongoose.startSession();
  
    try {
     session.startTransaction();
        
        const { investorID, stockID, shares } = req.body;
        


        // Use session in all database operations
        const Investor = await Investors.findById(investorID).session(session);
        const Stock = await Stocks.findById(stockID).session(session);
        
        if (!Investor || !Stock) {
            throw new Error('Investor or Stock not found');
        }
        
        const totalCost = shares * Stock.value;
        
        if (Investor.balance >= totalCost) {
            console.log(`making transaction for ${Investor.name}`);
            
            Investor.portfolio.push({
                stock: stockID,  // Fixed: 'Stock' -> 'stock' for consistency
                shares: shares
            });
            
            Investor.balance -= totalCost;
            Stock.shares -= shares;
            Stock.Owners[0]
            
            Stock.Owners.push({
                investor: Investor._id,  // Fixed: 'Investor' -> 'investor'
                sharesOwned: shares
            });

            updatePrice(Stock,shares);
            
            // Save with session
            await Investor.save({ session });
            await Stock.save({ session });
            
            // Create transaction with session (note the array syntax)
            const txn = await Transaction.create([{
                investor: Investor._id,
                stock: Stock._id,
                type: "BUY",
                shares: shares,
                value: Stock.value
            }], { session });
            
            await session.commitTransaction();
            
            res.status(201).json({
                message: "Transaction successful",
                details: txn[0]  // create returns array when used with []
            });
            
        } else {
            // Handle insufficient balance
            await session.abortTransaction();
            res.status(400).json({
                message: "Insufficient balance",
                required: totalCost,
                available: Investor.balance
            });
        }
        
    } catch (error) {
        // Always abort transaction on error
        await session.abortTransaction();
        next(error);
    } finally {
        // Always end session
        session.endSession();
    }
};
*/

export const buy= async(req,res)=>{
    
    const{investorID,stockID,shares}=req.body;  

    const session= await mongoose.startSession();

    session.startTransaction();
    try{
        const Investor= await Investors.findById(investorID).session(session);
        const Stock=await Stocks.findById(stockID).session(session);

        if (!Investor || !Stock) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Investor or Stock not found" });
        }

        const Shares=parseInt(shares);
        const pricePerShare= Stock.pricePerShare;
        const price=Shares*pricePerShare;
        const canBuy= Investor.balance >= price && Shares<=Stock.shares;
        const existingInvestor= Stock.Owners.find(owner=>
            owner.investor.toString()===investorID.toString()
        );

        if(!existingInvestor){
     

           if(!canBuy){
            await session.abortTransaction();

           return res.status(400).json({ 
                    message: "Cannot buy - insufficient balance or shares",
                    requiredBalance: price,
                    currentBalance: Investor.balance,
                    requiredShares: Shares,
                    availableShares: Stock.shares
                });

           }
           
           Investor.balance-=price;
           Stock.shares-=Shares;

           Stock.Owners.push({investor:Investor._id,sharesOwned:Shares});
           Investor.portfolio.push({stock:stockID,shares:Shares});
           updatePrice(Stock, Shares);

           await Investor.save({session});
           await Stock.save({session});

          
        }
        else{
        const investorIndex= Investor.portfolio.findIndex(stock=>
            stock.stock.toString()===stockID.toString()
        );
        const index= Stock.Owners.findIndex(owner=>
            owner.investor.toString()===investorID.toString()
        );

        if(!canBuy){
              await session.abortTransaction();

           return res.status(400).json({ 
                    message: "Cannot buy - insufficient balance or shares",
                    requiredBalance: price,
                    currentBalance: Investor.balance,
                    requiredShares: Shares,
                    availableShares: Stock.shares
                });
        }        
        
        Investor.balance-=price;
        Investor.portfolio[investorIndex].shares+=Shares;
        Stock.Owners[index].sharesOwned+=Shares;
        Stock.shares-=Shares;
        
        updatePrice(Stock,Shares);

        await Investor.save({session});
        await Stock.save({session});


    }

     const txn= await Transaction.create([{
            investor:investorID,
            stock:stockID,
            type:"BUY",
            shares:Shares,
            pricePerShare:pricePerShare
           }],{session});

           await session.commitTransaction();
           await session.endSession();
           return res.status(200).json({message:"transaction succesful",
                                        Transaction: txn[0]
           },

           );
           

    }catch(error){
        
        await session.abortTransaction();
        
        return console.error(error);
    }finally{
        session.endSession();
        
    }

};


/*export const sell = async (req, res, next) => {
    const { investorID, stockID, shares } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const Investor = await Investors.findById(investorID).session(session);
        const Stock = await Stocks.findById(stockID).session(session);
        const Shares = shares;

        // Find if investor owns the stock in Stock.Owners
        const stockOwner = Stock.Owners.find(owner => 
            owner.investor._id.toString() === investorID.toString()
        );

        if (!stockOwner) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ message: "Investor doesn't own this stock" });
        }

        // Find the portfolio item - keep the entire object, not just the stock
        const portfolioItem = Investor.portfolio.find(item => 
            item.stock.toString() === stockID.toString()
        );

        if (!portfolioItem) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ message: "Stock not found in portfolio" });
        }

        const stockOwner = portfolioItem.shares >= Shares; // Use >= instead of >

        if (!stockOwner) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ message: "Not enough shares to sell" });
        }

        // Execute transaction
        portfolioItem.shares -= Shares;
        
        // Remove from portfolio if shares become 0
        if (portfolioItem.shares === 0) {
            Investor.portfolio = Investor.portfolio.filter(item => 
                item.stock.toString() !== stockID.toString()
            );
        }
        
        Investor.balance += Shares * Stock.value;
        Stock.shares += Shares;
        Stock.Owners[0].sharesOwned-=Shares;

        updatePrice(Stock, -Shares);

        await Investor.save({session});
        await Stock.save({session});

        const txn = await Transaction.create([{
            investor: investorID,
            stock: stockID, // Use stockID instead of Stock object
            type: "SELL",
            shares: Shares,
            value: Stock.value
        }], { session });

        await session.commitTransaction();
        await session.endSession();

        res.status(200).json({
            message: "Transaction successful",
            data: txn[0],
            name: Investor.name, // Get from Investor, not txn
            stockname: Stock.name // Get from Stock, not txn
        });

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        next(error);
    }
};*/

export const sell= async(req,res)=>{

    const session= await mongoose.startSession();
    session.startTransaction();
    try{

        const{investorID,stockID,shares}=req.body;

        const Investor= await Investors.findById(investorID).session(session);
        const Stock= await Stocks.findById(stockID).session(session);
        const Shares= parseInt(shares);

        if(!Investor || !Stock){
            await session.abortTransaction();
            return res.status(400).json({
                message:"Either investor or stock does not exist"
            }); }

        const stockOwner= Stock.Owners.find(owner=>
            owner.investor.toString()===investorID.toString()
        )

        if(!stockOwner){
            await session.abortTransaction();
            return res.status(400).json({
                message:"You do not own this stock"
            });
        }

        

        const ownerIndex= Stock.Owners.findIndex(owner=>
            owner.investor.toString()===investorID.toString()
        )

        const stockIndex=Investor.portfolio.findIndex(stock=>
            stock.stock.toString()===stockID.toString()
        )

        const canSell= Investor.portfolio[stockIndex].shares>=Shares;

        if(!canSell){
            return res.status(400).json({
                message:"You do not have enough stocks to sell"
            });
        }

        const pricePerShare= Stock.pricePerShare;
        const price= pricePerShare*Shares;

        Investor.balance+=price;
        Stock.shares+=Shares;   
        Investor.portfolio[stockIndex].shares-=Shares;
        Stock.Owners[ownerIndex].sharesOwned-=Shares;
        
        updatePrice(Stock,-Shares);

       await Stock.save({session});
       await Investor.save({session});


        const txn= await Transaction.create([{
            investor:investorID,
            stock:stockID,
            type:"SELL",
            shares:Shares,
            pricePerShare:pricePerShare

        }],{session})

       await session.commitTransaction();
        
        return res.status(200).json({
            message:"Transaction successful",
            token:txn[0]
        })

        

        
    }catch(error){
        await session.abortTransaction();
        console.error(error);

        return res.status(400).json({
            message:"Error has occured",
            err:error.message

        });
    }finally{
        session.endSession();
    }

}



export const getUser= async(req,res) => {

    const userID= req.params.id;

    const Investor= await Investors.findById(userID);

    if(Investor){
        
        res.status(200).json({
            message:"GET request successful",
            data: Investor

        });
    
       
    }
 else{
            console.log("User not found");
        }
};

export const showTransactions = async (req,res) => {

    const transaction= await Transaction.find();

    if(transaction){
        res.status(200).json({
            message:"transactions created",
            data:transaction
        })
    }

}