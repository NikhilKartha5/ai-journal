import DiaryEntry from '../models/DiaryEntry.js';

export const createEntry = async (req, res) => {
  try {
    const { date, mood, content, analysis } = req.body;
    const entry = new DiaryEntry({
      user: req.userId,
      date,
      mood,
      content,
      analysis,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
