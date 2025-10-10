import mongoose from "mongoose";





const stockSchema= new mongoose.Schema({

name:{
    type:"String",
    requried:true,
},

value:{
    type:Number
},
shares:{
    type:Number,
},
Owners:[{
   investor: {type:mongoose.Schema.Types.ObjectId,ref:'Inevstors'},
   sharesOwned:{type:Number}

}],

});

const Stocks= mongoose.model('Stocks',stockSchema);

export default Stocks;