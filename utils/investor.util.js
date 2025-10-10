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
            res.status(300).json({
                message:"User found",
                User: InvestorID,
            })
        }
    }
    else{
        const error= new Error("Investor not found");
   
        throw error;
    }

        
    await session.commitTransaction();
    session.endSession();

    }catch(error){
        console.error('user does not exist',error);
       
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
    const txn= await generateToken(Investor[0]._id);
        await session.commitTransaction();
        session.endSession();

        res.status('201').json({
            Investor:Investor,
            token:txn
        });

    }catch(error){
        session.endSession();
        next(error);
    }

}