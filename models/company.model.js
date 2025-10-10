// models/Startup.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: String,
  
  //teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalShares: { type: Number, default: 10000 },
  pricePerShare: { type: Number, default: 10 },
  marketCap: { type: Number, default: 100000 },
 /* investors: [
    {
      investor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sharesOwned: Number
    }
  ]*/
});

const Company= mongoose.model('Company',companySchema);

export default Company;
