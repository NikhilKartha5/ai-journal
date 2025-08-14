import type { DiaryEntry, Recommendation } from '../types';
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


export const getRecommendations = (latestEntry?: DiaryEntry) => {
    const triggered: Recommendation[] = [];

    if (latestEntry) {
        const { emotions, summary } = latestEntry.analysis;

        const lowerCaseSummary = summary.toLowerCase();
        const lowerCaseEmotions = emotions.map(e => e.toLowerCase());

        if (lowerCaseEmotions.includes('anxiety') || lowerCaseEmotions.includes('fear') || lowerCaseSummary.includes('anxious')) {
             triggered.push({
                id: 'trigger_breathing_anxiety',
                type: 'exercise',
                title: 'Calming Breathing Exercise',
                description: 'You mentioned feeling anxious. Try the "4-7-8" breathing technique to help calm your nervous system.',
                source: 'Based on your recent entry',
                icon: CheckCircleIcon,
            });
        }
        if (lowerCaseEmotions.includes('sadness') || lowerCaseSummary.includes('sad') || lowerCaseSummary.includes('down')) {
             triggered.push({
                id: 'trigger_selfcompassion_video',
                type: 'video',
                title: 'Guided Self-Compassion Meditation',
                description: 'It sounds like you\'re having a tough time. This short meditation focuses on kindness towards yourself.',
                source: 'Based on your recent entry',
                link: '#',
                icon: VideoCameraIcon,
            });
        }
        if (lowerCaseSummary.includes('overwhelmed') || lowerCaseSummary.includes('procrastinating') || lowerCaseSummary.includes('too much to do')) {
             triggered.push({
                id: 'trigger_microtask',
                type: 'task',
                title: 'Complete One Small Task',
                description: 'Feeling overwhelmed can be paralyzing. Pick one tiny, 5-minute task and complete it to build momentum.',
                source: 'Based on your recent entry',
                icon: CheckCircleIcon,
            });
        }
    }

    return {
        triggered,
        resources: resourceLibrary,
    };
}
