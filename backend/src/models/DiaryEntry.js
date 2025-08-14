import mongoose from 'mongoose';

const diaryEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String },
  content: { type: String },
  analysis: { type: String },
});

export default mongoose.model('DiaryEntry', diaryEntrySchema);
