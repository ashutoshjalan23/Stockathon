import { Router } from "express";
import {signup} from "../utils/auth.util.js";
const authRouter= Router();

authRouter.post("/sign-up",signup);

authRouter.post("/sign-in",(req,res)=>{

    res.send({title:"Sign-in"});
});

authRouter.post("/sign-out",(req,res)=>{

    res.send({title:"Sign-out"});
});

export default authRouter;