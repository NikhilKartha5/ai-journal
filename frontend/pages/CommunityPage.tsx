import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchCommunityFeed, createCommunityPost, toggleLikeCommunityPost, purgeCommunityPosts } from '../services/apiService';
import { loadCommunityCache, cacheCommunity } from '../offline_sync';
import { CommunityPost } from '../types';
import { MicIcon, StopCircleIcon, SendIcon, HeartIcon, LoadingSpinner } from '../components/Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const CommunityPage: React.FC = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const { isListening, transcript, startListening, stopListening, error: speechError, isSupported } = useSpeechRecognition();

  // Merge transcript live
  useEffect(() => { if (isListening) setContent(transcript); }, [transcript, isListening]);

  const loadFeed = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    // Try cache first
    const cached = await loadCommunityCache();
    if (cached && cached.length) setPosts(cached);
    if (navigator.onLine) {
      try {
  const data = await fetchCommunityFeed(token) as any[];
  setPosts(data as any);
  cacheCommunity(data as any[]);
      } catch(e) { /* ignore */ }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleSubmit = async () => {
    if (!token || content.trim().length < 5) return;
    setSubmitting(true);
    try {
      if (!navigator.onLine) {
        // optimistic local only (not queued in this simple implementation)
        const temp: any = { id: 'temp-' + Date.now(), content: content.trim(), sentimentScore: 0, emotions: [], likes: 0, createdAt: new Date().toISOString(), author: 'You (offline)' };
        setPosts(prev => [temp, ...prev]);
        setContent('');
        return;
      }
      const newPost = await createCommunityPost(token, content.trim());
      setPosts(prev => [newPost, ...prev]);
      cacheCommunity([newPost, ...posts]);
      setContent('');
    } catch(e) { /* handle */ }
    setSubmitting(false);
  };

  const handleLike = async (id: string) => {
    if (!token) return;
    try {
      if (!navigator.onLine) return; // skip offline for now
      const res: any = await toggleLikeCommunityPost(token, id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: res.likes } : p));
      cacheCommunity(posts.map(p => p.id === id ? { ...p, likes: res.likes } : p));
    } catch(e) {}
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } }
  };

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      key="community-inner"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Community Wellness Feed</h1>
        <div className="flex items-center gap-3">
          <PurgeButton onPurged={() => { setPosts([]); cacheCommunity([]); }} />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Share an anonymized reflection</h2>
        <textarea
          className="w-full min-h-[90px] bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          placeholder="Something that helped me cope today was..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {isSupported && (
              <button onClick={isListening ? stopListening : startListening} className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1 ${isListening ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}> {isListening ? <StopCircleIcon/> : <MicIcon/>} {isListening ? 'Stop' : 'Voice'} </button>
            )}
            {speechError && <span className="text-xs text-red-500">{speechError}</span>}
          </div>
          <button disabled={submitting || content.trim().length<5} onClick={handleSubmit} className="flex items-center bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md shadow transition-colors">
            {submitting ? <LoadingSpinner className="h-4 w-4"/> : <SendIcon/>} Post
          </button>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">Posts are anonymized. Please avoid sharing identifying or crisis information.</p>
      </div>
      <div>
        {loading ? <p className="text-slate-500 dark:text-slate-400">Loading...</p> : (
          posts.length === 0 ? <p className="text-slate-500 dark:text-slate-400">No posts yet. Be the first to share something supportive.</p> : (
            <motion.ul className="space-y-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
              {posts.map(p => (
                <motion.li
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{p.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{p.author}</span>
                        <span>{new Date(p.createdAt).toLocaleString()}</span>
                        <span>Mood: {p.sentimentScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <button onClick={() => handleLike(p.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 hover:scale-105 transition">
                      <HeartIcon className="h-4 w-4"/> {p.likes}
                    </button>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )
        )}
      </div>
    </motion.div>
  );
};

// Simple purge button component (requires manual purge key input)
interface PurgeButtonProps { onPurged?: () => void }
const PurgeButton: React.FC<PurgeButtonProps> = ({ onPurged }) => {
  const { token } = useAuth();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const doPurge = async () => {
    if (!token || !key) return;
    setLoading(true); setStatus(null);
    try {
      const res: any = await purgeCommunityPosts(token, key);
      const count = (res && (res.deleted ?? res.count ?? 0));
      setStatus('Deleted ' + count + ' posts');
      onPurged && onPurged();
    } catch (e: any) {
      setStatus(e?.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };
  return (
    <div className="relative">
      {!show && (
        <button onClick={() => setShow(true)} className="text-xs px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow">
          Reset Feed
        </button>
      )}
      {show && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Enter purge key to delete ALL posts. Action is irreversible.</p>
          <input value={key} onChange={e=>setKey(e.target.value)} placeholder="Purge key" type="password" className="w-full text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={()=>{setShow(false); setKey('');}} className="text-[11px] px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">Cancel</button>
            <button disabled={loading || !key} onClick={doPurge} className="text-[11px] px-2 py-1 rounded bg-rose-600 disabled:opacity-50 text-white">{loading? 'Purging...' : 'Confirm'}</button>
          </div>
          {status && <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{status}</p>}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
