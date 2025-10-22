import mongoose from "mongoose";

const investorSchema= new mongoose.Schema({

    name:{
        type:'String',
        required: true,
    },
    password:{
        type:'String',
        default:'asfafsadcaojneofwbusmcnx#0128djal',
    },
    balance: {
        type:Number,
        default:10000
    },
    portfolio:[{
       stock: {type: mongoose.Schema.Types.ObjectId,
        ref:"Stocks"},
        shares:Number,
    }],

    role:{
        type:'String',
        default:'Investor'
    }

});

const Investors=  mongoose.model('Investors',investorSchema);

export default Investors;