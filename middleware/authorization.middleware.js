
import { API_KEY, JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";

import Investors from "../models/investor.model.js";


export const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    
    if (!apiKey) {
        return res.status(401).json({ 
            message: "API key required",
            error: "Missing API key in headers" 
        });
    }
    
    if (apiKey !== API_KEY) {
        return res.status(403).json({ 
            message: "Invalid API key",
            error: "Authentication failed" 
        });
    }
    
    next();
};


export const authenticateToken= async(req,res,next) => {
        try{
            let token;

            if(req.headers.authorization &&  req.headers.authorization.startsWith("Bearer")){
                token= req.headers.authorization.split(' ')[1];

            }
            if(!token) return res.status(401).json({message:"Token is required"});

            const decoded= jwt.verify(token,JWT_SECRET);

            const user= await Investors.findById(decoded.userId);

            req.user=user;
            console.log("Token authenticated", user);
            next();

        }catch(err){
            console.error(err); 

        }
}