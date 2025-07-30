import { SessionData } from '@/hooks/useSessionAnalytics';

export interface EmotionInsight {
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  description: string;
  recommendation: string;
}

export const generateEmotionInsights = (sessionData: SessionData): EmotionInsight[] => {
  const insights: EmotionInsight[] = [];
  const { emotions, dominantEmotions, emotionChanges, duration } = sessionData;

  if (emotions.length === 0) {
    return [{
      type: 'neutral',
      title: 'No Data Yet',
      description: 'Start analyzing to see insights about your emotional state.',
      recommendation: 'Begin emotion analysis to track your emotional patterns.'
    }];
  }

  // Calculate emotion percentages
  const totalEmotions = Object.values(dominantEmotions).reduce((sum, count) => sum + count, 0);
  const emotionPercentages = Object.entries(dominantEmotions).map(([emotion, count]) => ({
    emotion,
    percentage: (count / totalEmotions) * 100
  })).sort((a, b) => b.percentage - a.percentage);

  // Dominant emotion analysis
  const topEmotion = emotionPercentages[0];
  if (topEmotion) {
    if (['happy', 'surprised'].includes(topEmotion.emotion)) {
      insights.push({
        type: 'positive',
        title: 'Positive Emotional State',
        description: `You've shown ${topEmotion.emotion} emotions ${topEmotion.percentage.toFixed(1)}% of the time.`,
        recommendation: 'Great! Keep engaging in activities that bring you joy and maintain this positive energy.'
      });
    } else if (['sad', 'angry', 'fearful', 'disgusted'].includes(topEmotion.emotion)) {
      insights.push({
        type: 'concern',
        title: 'Elevated Stress Indicators',
        description: `${topEmotion.emotion} emotions dominated ${topEmotion.percentage.toFixed(1)}% of your session.`,
        recommendation: 'Consider taking deep breaths, practicing mindfulness, or engaging in calming activities like meditation or gentle music.'
      });
    } else {
      insights.push({
        type: 'neutral',
        title: 'Balanced Emotional State',
        description: `Your emotions have been primarily neutral (${topEmotion.percentage.toFixed(1)}% of the time).`,
        recommendation: 'Try engaging in activities that spark joy or excitement to enhance your mood.'
      });
    }
  }

  // Emotion variability analysis
  const sessionMinutes = duration / (1000 * 60);
  const changeRate = sessionMinutes > 0 ? emotionChanges / sessionMinutes : 0;

  if (changeRate > 2) {
    insights.push({
      type: 'concern',
      title: 'High Emotional Variability',
      description: `Your emotions changed ${emotionChanges} times in ${sessionMinutes.toFixed(1)} minutes.`,
      recommendation: 'High emotional variability might indicate stress. Try grounding techniques: focus on 5 things you can see, 4 you can touch, 3 you can hear.'
    });
  } else if (changeRate < 0.5 && sessionMinutes > 2) {
    insights.push({
      type: 'neutral',
      title: 'Stable Emotional State',
      description: 'Your emotions have been relatively stable throughout the session.',
      recommendation: 'Emotional stability is good! Consider adding some variety to your activities if you feel too monotonous.'
    });
  }

  // Session duration insights
  if (sessionMinutes > 10) {
    insights.push({
      type: 'positive',
      title: 'Extended Session',
      description: `You've been engaged for ${sessionMinutes.toFixed(1)} minutes.`,
      recommendation: 'Long sessions can be draining. Consider taking a short break to stretch or hydrate.'
    });
  }

  // Happiness boost recommendations
  const happyPercentage = emotionPercentages.find(e => e.emotion === 'happy')?.percentage || 0;
  if (happyPercentage < 30) {
    insights.push({
      type: 'neutral',
      title: 'Mood Enhancement Opportunity',
      description: 'Limited positive emotions detected in this session.',
      recommendation: 'Try smiling, listening to upbeat music, thinking of something you\'re grateful for, or watching something funny.'
    });
  }

  return insights;
};