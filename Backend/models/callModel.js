import mongoose, { Schema } from "mongoose";

const callModel = new Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callType: { type: String, enum: ['audio', 'video'], required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ['missed', 'accepted', 'rejected'], default: 'accepted' },
}, { timestamps: true })

const Call = mongoose.model('Call',callModel);
export default Call;