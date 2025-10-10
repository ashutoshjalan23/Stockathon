import { Router } from "express";

import { companyCreator } from "../utils/company.util.js";


const companyRouter= Router();

companyRouter.post('/',companyCreator);

export default companyRouter;