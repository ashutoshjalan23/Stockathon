

import mongoose from "mongoose";
import Auth from "../models/auth.model.js";

export const authLogin= async(req,res,next)=>{

   try{
    const {name,password}= req.body;
    const auth= await Auth.findOne({name});
    console.log(auth);
    if(auth){
     
           if(password==auth.password){
        res.send();
        console.log("Admin logged in");
    }
    else{
        const error= new Error("Invalid password");
        console.error(error);
        res.status(300).json({message:"Invalid password"});
    }

    }else{
        const error= new Error("Invalid");
        console.error(error);
        res.status(300).send("Not found");
    }
}catch(error){
  
    console.error(error);

    res.status(300).json({message:"Something went wrong"});
}
};

export const authCreate=async() =>{
const session= await mongoose.startSession();
session.startTransaction();
try{
const auth= await Auth.create({session})
console.log(auth);

}catch(error){
    console.error(error);
}

};