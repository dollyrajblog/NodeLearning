const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  lastMessageAt: { type: Date, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
