import mongoose, { Schema } from "mongoose";

const friendRequestModel = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
  },
}, { timestamps: true });

const FriendRequest = mongoose.model('FriendRequest',friendRequestModel);

export default FriendRequest;