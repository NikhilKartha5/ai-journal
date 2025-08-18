import mongoose from 'mongoose';

const diaryEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String },
  title: { type: String, trim: true },
  tags: { type: [String], default: [] },
  content: { type: String },
  analysis: { type: String },
}, { timestamps: true });

export default mongoose.model('DiaryEntry', diaryEntrySchema);
