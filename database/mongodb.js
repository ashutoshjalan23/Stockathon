import mongoose from 'mongoose';

import { DB_URI,NODE_ENV, PORT } from '../config/env.js';

if(!DB_URI){
    throw new Error("Please MongoDB URI inside .env file");
};
const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB_URI);

        console.log(`Database successfully connected at ${PORT} in env:${NODE_ENV} `)
    } 
    catch(error){
        console.error("Could not conneect to database", error);

        process.exit(1);
    }
};

export default connectToDatabase;