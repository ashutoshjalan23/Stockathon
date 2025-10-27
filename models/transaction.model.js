import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  investor: { type: mongoose.Schema.Types.ObjectId, ref: "Investors" },
  startup: { type: mongoose.Schema.Types.ObjectId, ref: "Stocks" },
  type: { type: String, enum: ["BUY", "SELL"], required: true },
  shares: Number,
  pricePerShare: Number,
  timestamp: { type: Date, default: Date.now }
});

const Transaction= mongoose.model('Transaction',transactionSchema);

export default Transaction;