import { config } from "dotenv";

config({path:`.env.${process.env.NODE_ENV || 'development'}.local`});

export const{ PORT, NODE_ENV , DB_URI,API_KEY,JWT_SECRET,AUTH_NAME,AUTH_PASSWORD}= process.env;  