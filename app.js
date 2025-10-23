import express from 'express';

import connectToDatabase from './database/mongodb.js';


import {PORT} from './config/env.js';


import stocksRouter from './routes/stocks.routes.js';
import authRouter from './routes/auth.routes.js';


import investorRouter from './routes/investor.routes.js';
import portfolioRouter from './routes/portfolio.routes.js';

const app= express();


app.use(express.json({ 
  type: ['application/json', 'text/plain'] // Also parse plain text as JSON
}));


app.use('/api/v1/portfolio',portfolioRouter);
app.use('/api/v1/investors',investorRouter);
app.use('/api/v1/stocks', stocksRouter);

app.use( '/api/v1/auth',authRouter);
app.use( '/api/v1/stocks',stocksRouter);


app.get('/',(req,res) => {

res.json({message:'Hello World'});

});





const localPORT= PORT || 3000;


app.listen(localPORT, async ()=>{

        console.log(`server is running successfully on: http://localhost:${PORT}`);

        await connectToDatabase();
});

export default app;
