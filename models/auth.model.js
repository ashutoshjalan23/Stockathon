import mongoose from "mongoose";
import { AUTH_NAME,AUTH_PASSWORD } from "../config/env.js";

const authSchema= new mongoose.Schema({

name:{type:'String', default:AUTH_NAME},
password:{type:'String',default:AUTH_PASSWORD},
role:{type:'String',default:"Admin"}
})

const Auth= mongoose.model('Auth',authSchema);

export default Auth;

