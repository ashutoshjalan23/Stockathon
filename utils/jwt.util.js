import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const generateToken= async(userId)=>{

    return jwt.sign( {userId:userId}, JWT_SECRET,{expiresIn:'7d'}   );
    

};

