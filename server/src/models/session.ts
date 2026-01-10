import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'persona'], required: true },
  content: { type: String, required: true },
  metrics: {
    latency: Number,      // ms
    editCount: Number,   // backspaces
    sentimentScore: Number
  },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  userId: String, // We'll use this for persistent memory
  messages: [MessageSchema],
  status: { type: String, default: 'active' }
});

export default mongoose.model('Session', SessionSchema);