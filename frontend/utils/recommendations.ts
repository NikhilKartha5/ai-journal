import type { DiaryEntry, Recommendation, EmotionSuggestion } from '../types';
import {
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '../components/Icons';

const resourceLibrary: Recommendation[] = [
  {
    id: 'vid_calm_meditation',
    type: 'video',
    title: '10-Minute Guided Meditation for Calm',
    description: 'Follow this guided session to find a moment of peace and reduce stress.',
    source: 'General Wellness',
    link: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    icon: VideoCameraIcon,
  },
  {
    id: 'article_cbt_intro',
    type: 'article',
    title: 'Understanding Cognitive Distortions',
    description: 'Learn to identify and challenge common negative thought patterns. A key concept in CBT.',
    source: 'Cognitive Behavioral Therapy',
    link: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'task_box_breathing',
    type: 'exercise',
    title: 'Practice Box Breathing',
    description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 5 times to calm your nervous system.',
    source: 'Breathing Exercise',
    icon: CheckCircleIcon,
  },
  {
    id: 'vid_yoga_anxiety',
    type: 'video',
    title: 'Yoga for Anxiety and Stress',
    description: 'A gentle 20-minute yoga practice to help you release tension and feel more grounded.',
    source: 'General Wellness',
    link: 'https://www.youtube.com/watch?v=hJbRpHq_eGU',
    icon: VideoCameraIcon,
  },
   {
    id: 'article_sleep_hygiene',
    type: 'article',
    title: 'Tips for Better Sleep',
    description: 'Explore simple, effective strategies to improve your sleep quality and hygiene.',
    source: 'General Wellness',
    link: '#',
    icon: DocumentTextIcon,
  },
   {
    id: 'task_gratitude_list',
    type: 'task',
    title: 'Write Down 3 Things You\'re Grateful For',
    description: 'Take a moment to focus on the positive. It can be something small, like a cup of coffee, or something big.',
    source: 'Positive Psychology',
    icon: CheckCircleIcon,
  },
];

// General & Popular universal resources (3–5)
const generalPopular: Recommendation[] = [
  {
    id: 'gen_grounding_5senses',
    type: 'exercise',
    title: '5‑Senses Grounding',
    description: 'Quickly calm overwhelm: list 5 see, 4 touch, 3 hear, 2 smell, 1 taste.',
    source: 'Universal Coping',
    icon: SparklesIcon,
    category: 'popular'
  },
  {
    id: 'gen_box_breathing',
    type: 'exercise',
    title: 'Box Breathing 4×4',
    description: 'Inhale 4 • hold 4 • exhale 4 • hold 4. Repeat 4 rounds to steady nerves.',
    source: 'Breathing',
    icon: CheckCircleIcon,
    category: 'popular'
  },
  {
    id: 'gen_sleep_hygiene',
    type: 'article',
    title: 'Sleep Hygiene Mini Guide',
    description: 'Reduce blue light 60m before bed, consistent wake time, wind‑down ritual.',
    source: 'Rest & Recovery',
    icon: DocumentTextIcon,
    category: 'popular'
  },
  {
    id: 'gen_emergency_hotlines',
    type: 'article',
    title: 'Need Immediate Help?',
    description: 'Reach local emergency services or a trusted hotline if in crisis.',
    source: 'Safety',
    icon: DocumentTextIcon,
    category: 'popular'
  },
  {
    id: 'gen_positive_reflection',
    type: 'task',
    title: 'Positive Reflection (2 mins)',
    description: 'Write 1 thing you did well today + why it mattered to you.',
    source: 'Positive Psychology',
    icon: CheckCircleIcon,
    category: 'popular'
  }
];

interface ThreeSectionRecommendations {
  personalized: Recommendation[]; // recent entry based
  pattern: Recommendation[];      // trends across entries
  general: Recommendation[];      // universal / popular
  emotionBundles: EmotionSuggestion[]; // emotion-tagged quick picks
}

export const getRecommendations = (latestEntry?: DiaryEntry, allEntries: DiaryEntry[] = []): ThreeSectionRecommendations => {
  const personalized: Recommendation[] = [];
  if (latestEntry) {
    const { emotions, summary } = latestEntry.analysis;
    const lowerCaseSummary = summary.toLowerCase();
    const lowerCaseEmotions = emotions.map(e => e.toLowerCase());
    if (lowerCaseEmotions.some(e => ['anxiety','fear','panic'].includes(e)) || lowerCaseSummary.includes('anxious')) {
      personalized.push({
        id: 'recent_breathing_anxiety',
        type: 'exercise',
        title: '4‑7‑8 Breathing',
        description: 'Regulate nervous system: inhale 4, hold 7, exhale 8 – 4 cycles.',
        source: 'Recent feelings',
        icon: CheckCircleIcon,
        category: 'recent'
      });
    }
    if (lowerCaseEmotions.includes('sadness') || ['sad','down','low','lonely'].some(k => lowerCaseSummary.includes(k))) {
      personalized.push({
        id: 'recent_self_compassion',
        type: 'video',
        title: 'Self‑Compassion Mini Practice',
        description: 'Acknowledge pain, remind common humanity, offer yourself a kind phrase.',
        source: 'Recent feelings',
        icon: VideoCameraIcon,
        category: 'recent'
      });
    }
    if (['overwhelmed','procrastinating','too much to do','can\'t start'].some(k => lowerCaseSummary.includes(k))) {
      personalized.push({
        id: 'recent_microtask',
        type: 'task',
        title: '1 Micro‑Task Momentum',
        description: 'Choose a task < 5 minutes and complete it to break inertia.',
        source: 'Recent themes',
        icon: CheckCircleIcon,
        category: 'recent'
      });
    }
  }

  // Pattern based: analyze last 14 days for dominant emotions & volatility
  const pattern: Recommendation[] = [];
  if (allEntries.length >= 5) {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentEntries = allEntries.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    const emotionCounts = recentEntries.flatMap(e => e.analysis.emotions).reduce((acc, em) => { const k = em.toLowerCase(); acc[k] = (acc[k]||0)+1; return acc; }, {} as Record<string,number>);
    const sorted = Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1]);
    if (sorted.length) {
      const [topEmotion, count] = sorted[0];
      if (count >= 3) {
        pattern.push({
          id: 'pattern_emotion_focus_'+topEmotion,
          type: 'article',
          title: `Understanding Your ${topEmotion} Pattern`,
          description: `You\'ve mentioned '${topEmotion}' frequently recently. Reflect on triggers & coping strategies in a quick journal prompt.`,
          source: 'Recent pattern',
          icon: DocumentTextIcon,
          category: 'pattern'
        });
      }
    }
    const scores = recentEntries.map(e => e.analysis.sentimentScore);
    if (scores.length >= 6) {
      const mean = scores.reduce((a,b)=>a+b,0)/scores.length;
      const variance = scores.reduce((a,b)=> a + Math.pow(b-mean,2),0)/scores.length;
      const std = Math.sqrt(variance);
      if (mean > 0 && std/mean >= 0.35) {
        pattern.push({
          id: 'pattern_mood_volatility',
          type: 'exercise',
          title: 'Daily Anchor Routine',
          description: 'Introduce 2 fixed micro‑routines (wake stretch, evening reflection) to stabilize mood swings.',
          source: 'Pattern: volatility',
          icon: SparklesIcon,
          category: 'pattern'
        });
      }
    }
  }

  // Emotion-tagged quick bundles (static mapping)
  const emotionMap: Record<string, EmotionSuggestion> = {
    anxiety: { emotion: 'anxiety', items: [
      { id: 'em_anx_box', type: 'exercise', title: 'Box Breathing', description: 'Slow 4×4 breathing to reduce arousal.', source: 'Anxiety Relief', icon: CheckCircleIcon },
      { id: 'em_anx_label', type: 'task', title: 'Name & Rate It', description: 'Label the worry + rate 0–10. Naming lowers intensity.', source: 'Emotion Regulation', icon: SparklesIcon }
    ]},
    sadness: { emotion: 'sadness', items: [
      { id: 'em_sad_selfkind', type: 'exercise', title: 'Self‑Kind Phrase', description: 'Write a kind sentence you’d tell a friend.', source: 'Self-Compassion', icon: CheckCircleIcon },
      { id: 'em_sad_activation', type: 'task', title: 'Tiny Activation', description: 'Do a 2‑minute pleasant activity (step outside).', source: 'Behavioral Activation', icon: SparklesIcon }
    ]},
    anger: { emotion: 'anger', items: [
      { id: 'em_ang_pause', type: 'task', title: '90‑Second Pause', description: 'Let the surge pass before responding.', source: 'Impulse Control', icon: CheckCircleIcon },
      { id: 'em_ang_discharge', type: 'exercise', title: 'Physical Discharge', description: 'Quick brisk walk or wall push to release tension.', source: 'Somatic Release', icon: SparklesIcon }
    ]},
    loneliness: { emotion: 'loneliness', items: [
      { id: 'em_lon_reach', type: 'task', title: 'Reach Out (1 msg)', description: 'Send a low‑stakes hello to someone.', source: 'Connection', icon: CheckCircleIcon },
      { id: 'em_lon_selfsoothe', type: 'exercise', title: 'Self‑Soothe 5 mins', description: 'Comforting sensory input: warm drink or soft music.', source: 'Soothing', icon: SparklesIcon }
    ]},
    stress: { emotion: 'stress', items: [
      { id: 'em_str_prioritize', type: 'task', title: 'Prioritize Top 1', description: 'List tasks → circle only today’s One Thing.', source: 'Focus', icon: CheckCircleIcon },
      { id: 'em_str_body', type: 'exercise', title: 'Shoulder Roll Set', description: '10 slow rolls + neck stretch to release tension.', source: 'Body Reset', icon: SparklesIcon }
    ]},
    overwhelm: { emotion: 'overwhelm', items: [
      { id: 'em_ovw_brain_dump', type: 'task', title: '2‑Minute Brain Dump', description: 'Write everything cluttering mind; then group.', source: 'Externalization', icon: CheckCircleIcon },
      { id: 'em_ovw_timebox', type: 'task', title: '10‑Minute Timebox', description: 'Work focused for 10 min—restart momentum.', source: 'Activation', icon: SparklesIcon }
    ]},
    happiness: { emotion: 'happiness', items: [
      { id: 'em_hap_savor', type: 'task', title: 'Savor Moment', description: 'Pause & note 3 sensory details you enjoy.', source: 'Savoring', icon: CheckCircleIcon },
      { id: 'em_hap_share', type: 'task', title: 'Share Good News', description: 'Tell someone a positive detail—amplifies mood.', source: 'Capitalization', icon: SparklesIcon }
    ]},
  };

  const emotionBundles: EmotionSuggestion[] = Object.values(emotionMap);

  return { personalized, pattern, general: generalPopular, emotionBundles };
};
