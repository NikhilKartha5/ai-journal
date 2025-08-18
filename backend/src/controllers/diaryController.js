import DiaryEntry from '../models/DiaryEntry.js';

export const createEntry = async (req, res) => {
  try {
    const { date, mood, content, analysis, title, tags } = req.body;
    const entry = new DiaryEntry({
      user: req.userId,
      date,
      mood,
      title: title?.slice(0, 240),
      tags: Array.isArray(tags) ? tags.slice(0, 12).map(t => String(t).slice(0,32)) : [],
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
    const { baseVersion, ...updates } = req.body || {};
    const existing = await DiaryEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!existing) return res.status(404).json({ message: 'Entry not found' });
    if (baseVersion && existing.updatedAt && existing.updatedAt.toISOString() !== baseVersion) {
      return res.status(409).json({ message: 'Version conflict', conflict: true, server: existing });
    }
  if (updates.title !== undefined) existing.title = String(updates.title).slice(0,240);
  if (updates.tags !== undefined && Array.isArray(updates.tags)) existing.tags = updates.tags.slice(0,12).map(t=>String(t).slice(0,32));
  if (updates.content !== undefined) existing.content = updates.content;
  if (updates.mood !== undefined) existing.mood = updates.mood;
  if (updates.analysis !== undefined) existing.analysis = updates.analysis;
    await existing.save();
    res.json(existing);
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

// Delete all entries for the authenticated user
export const deleteAllEntries = async (req, res) => {
  try {
    const result = await DiaryEntry.deleteMany({ user: req.userId });
    res.json({ message: 'All entries deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
