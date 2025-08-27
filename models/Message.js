const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  text: String,
  mediaUrl: String,
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
