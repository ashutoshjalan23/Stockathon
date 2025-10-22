import mongoose from "mongoose";
import Company from '../models/company.model.js';
import bcrypt from "bcryptjs";
import { hashedPassword } from "./password.util.js";
import { generateToken } from "./jwt.util.js";

export const companyCreator = async(req,res,next) => {


    const session= await mongoose.startSession();
    session.startTransaction();
    
    try{
        const {name,password}=req.body;

        const exisitngCompany= await Company.findOne({name});

        if(exisitngCompany){
            const error= new Error('Company already exists');
            error.statusCode=409;
            throw error;
        }
        
        const company= await Company.create([{name:name,password:await hashedPassword(password)}],{session});
 

        res.status('201').json({
            Company:company,
          
        });

    }catch(error){
        session.endSession();
        next(error);
    }

}

export const companySignin=async (req,res,next) => {

 const session= await mongoose.startSession();
 
    session.startTransaction();

    try{
        const{name,password}=req.body;

        const CompanyID= await Company.findOne({name});
        if(CompanyID){

        if(await bcrypt.compare(password,CompanyID.password)){

            const txn= await generateToken(InvestorID);
            await session.commitTransaction();
            session.endSession();

            res.status(300).json({
                message:"Company found",
                User: CompanyID,
                bearer:txn
            })
        }
    }
    else{
        const error= new Error("Company not found");
   
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
