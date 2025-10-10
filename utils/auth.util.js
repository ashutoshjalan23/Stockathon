import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "../node_modules/bcrypt/bcrypt.js";


export const signup= async (req,res,next) =>{
   

    const session= await mongoose.startSession();

    session.startTransaction();

 try{    const {name,role,password}= req.body;

     //CHECK IF EXISTS

     const existingUser= await User.findOne({name});
    if(existingUser){
        const error=new Error('User already exists');
        error.statusCode=409;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(password,salt);


    const newUsers= await User.create([{name,role,hashedPassword}], {session});

    await session.commitTransaction();
    session.endSession();

    res.status(202).json({
        success:true,
        message:'USER CREATED',
       
        user: newUsers[0]
    })

    }
 catch(error){

session.endSession();
next(error);
 }

};