import CommunityPost from '../models/CommunityPost.js';
import sentiment from 'sentiment';

const sentimentAnalyzer = new sentiment();

// Map raw sentiment score (arbitrary range) to 1-10 scale
const normalizeScore = (raw) => {
  // sentiment library returns roughly from -inf to +inf but typical range -50..50; clamp
  const clamped = Math.max(-30, Math.min(30, raw));
  const normalized = ((clamped + 30) / 60) * 9 + 1; // map to 1..10
  return parseFloat(normalized.toFixed(2));
};

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ message: 'Content too short' });
    }
    const analysis = sentimentAnalyzer.analyze(content);
    const emotions = []; // placeholder (could integrate more advanced model later)
    const post = await CommunityPost.create({
      user: req.userId,
      content: content.trim(),
      sentimentScore: normalizeScore(analysis.score),
      emotions,
    });
    // Populate user so we can construct anonymized consistent shape with feed
    await post.populate('user', 'username');
    const anonymized = {
      id: post._id,
      content: post.content,
      sentimentScore: post.sentimentScore,
      emotions: post.emotions,
      likes: post.likes.length,
      createdAt: post.createdAt,
      author: 'User-' + post.user.username.slice(0,2) + '***'
    };
    res.status(201).json(anonymized);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(100).populate('user', 'username');
    // Anonymize user names (hash or masked). Simple mask here.
    const anonymized = posts.map(p => ({
      id: p._id,
      content: p.content,
      sentimentScore: p.sentimentScore,
      emotions: p.emotions,
      likes: p.likes.length,
      createdAt: p.createdAt,
      author: 'User-' + p.user.username.slice(0,2) + '***'
    }));
    res.json(anonymized);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const idx = post.likes.findIndex(u => u.toString() === req.userId);
    if (idx === -1) post.likes.push(req.userId); else post.likes.splice(idx,1);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Danger: Delete all community posts. Protected by a purge key header.
export const deleteAllPosts = async (req, res) => {
  try {
    const purgeKey = process.env.COMMUNITY_PURGE_KEY;
    if (!purgeKey) return res.status(500).json({ message: 'Purge key not configured' });
    const provided = req.headers['x-purge-key'];
    if (provided !== purgeKey) return res.status(403).json({ message: 'Forbidden' });
    const result = await CommunityPost.deleteMany({});
    res.json({ message: 'All community posts deleted', deleted: result.deletedCount });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};
