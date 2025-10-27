import { Router } from "express";
import { validateApiKey } from "../middleware/authorization.middleware.js";
import {authCreate, authLogin, getAllAdmins} from "../utils/auth.util.js";
const authRouter= Router();

authRouter.get('/all',validateApiKey,getAllAdmins);
authRouter.get('/',validateApiKey,authLogin);
authRouter.post('/',validateApiKey,authCreate);

export default authRouter;