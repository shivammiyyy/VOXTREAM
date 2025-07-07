import mongoose, { Schema } from "mongoose";

const friendRequestModel = new Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
  },
}, { timestamps: true });

const FriendRequest = mongoose.model('FriendRequest',friendRequestModel);

export default FriendRequest;