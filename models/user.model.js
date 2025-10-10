import mongoose from 'mongoose';

const userSchema= new mongoose.Schema({

    name :{
        type: 'String',
        required: [true,"Required field"],
        trim: true,
        minLength: 2,
        maxLength: 50
    },

    role:{
        type:'String',
        enum:["investor","startup"],
        required:true   
    },

    password: {

        type:'String',
        requied:[true,"Please enter a password"],
        minLength:8,


    },

    portoflio:[
        {
            startup: {type:mongoose.Schema.Types.ObjectId,
                      ref: "Company"},
                    shares:Number,
                    avgPrice: Number
            }
        
    ],

    balance: {
        type: Number,
        default:10000
    }



},{timestamp:true});

const User= mongoose.model('User',userSchema);

export default User;

