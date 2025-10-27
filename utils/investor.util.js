import mongoose from "mongoose";
import Investor from "../models/investor.model.js";
import Investors from "../models/investor.model.js";
import bcrypt from "bcryptjs";
import { hashedPassword } from "./password.util.js";
import { generateToken } from "./jwt.util.js";


export const signin=async (req,res,next) => {

 const session= await mongoose.startSession();
 
    session.startTransaction();

    try{
        const{name,password}=req.body;

        const InvestorID= await Investor.findOne({name});
        if(InvestorID){

        if(await bcrypt.compare(password,InvestorID.password)){

            const token= await generateToken(InvestorID);
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                message:"Investor logged in successfully",
                token: token,
                user: { 
                    _id: InvestorID._id,
                    name: InvestorID.name, 
                    balance: InvestorID.balance, 
                    role: InvestorID.role 
                }
            })
            
        } else {
            await session.abortTransaction();
            session.endSession();
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    else{
        await session.abortTransaction();
        session.endSession();
        res.status(401).json({ message: 'Investor not found' });
    }

    }catch(error){
        console.error('user does not exist',error);
        await session.abortTransaction();
        session.endSession();

        next(error);
    }


};



export const signup = async(req,res,next) => {


    const session= await mongoose.startSession();
    session.startTransaction();
    
    try{
        const {name,password}=req.body;

        const exisitngInvestor= await Investors.findOne({name});

        if(exisitngInvestor){
            const error= new Error('investor already exists');
            error.statusCode=409;
            throw error;
        }
        
        const Investor= await Investors.create([{name:name,password:await hashedPassword(password)}],{session});
  

        res.status('201').json({
            Investor:Investor[0],
          
        });

        await session.commitTransaction();
        session.endSession();
    }catch(error){
        session.endSession();
        next(error);
    }

}

export const getAllInvestors = async(req,res) => {
    try {
        const investors = await Investors.find().select('name _id balance portfolio role');
        
        if(investors) {
            res.status(200).json({
                message: "Investors retrieved successfully",
                investors: investors
            });
        } else {
            res.status(404).json({ message: "No investors found" });
        }
    } catch(error) {
        console.error('Error fetching investors:', error);
        res.status(500).json({ message: "Error fetching investors", error: error.message });
    }
}