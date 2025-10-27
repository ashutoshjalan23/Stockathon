import mongoose from "mongoose";





const stockSchema= new mongoose.Schema({

name:{
    type:"String",
    requried:true,
},

password:{
    type:'String',
    required:true
},

pricePerShare:{
    type:Number,
    default:100
},
shares:{
    type:Number,
    default:1000
},
marketCap:{
    type:Number
},
Owners:[{
   investor: {type:mongoose.Schema.Types.ObjectId,ref:'Investors'},
   sharesOwned:{type:Number}

}],

});

const Stocks= mongoose.model('Stocks',stockSchema);

export default Stocks;