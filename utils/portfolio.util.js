import Stocks from "../models/stock.model.js";

export const showPortfolio = async (req,res) => {

    try{
    const Investor =req.user;

 

let portfolio=[];
  for(let i=0;i<Investor.portfolio.length;i++){

    const stock= await Stocks.findById(Investor.portfolio[i].stock);
    const shares= Investor.portfolio[i].shares;

    portfolio.push({
        stock:stock,
        shares:shares
    });

  }

  res.status(200).json({
    message:"GET Req successful",
    portfolio:portfolio,
  })

}catch(error){
    console.error(error);
    res.status(401).json({message:"Bearer token required"});
}

};