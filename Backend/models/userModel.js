import mongoose, { Schema } from "mongoose";

const userModel = new Schema({
    email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    },
    username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
    },
    fullName : {
            type: String,
            required: true,
            trim: true,
            index: true
    },
    avatar : {
            type: String,   
            required: true
    },
    location : {
        type : String,
        required: true
    },
    bio: {
        type: String,
        required: true,
    },
    hobbies: {
        type: [String],
        default: []
    }

},{
    timestamps:true
})

const User = mongoose.model('User', userModel);

export default User;
