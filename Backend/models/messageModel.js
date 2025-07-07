import mongoose, { Schema } from "mongoose";

const messageModel = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image'], default: 'text' },
    timestamp: { type: Date, default: Date.now },
},{
    timestamps: true,
})

const Message  = mongoose.model('Message',messageModel);

export default Message;