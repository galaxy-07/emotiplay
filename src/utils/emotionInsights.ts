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
        title: '🌟 Radiating Positivity!',
        description: `You've been glowing with ${topEmotion.emotion} vibes ${topEmotion.percentage.toFixed(1)}% of the time! Your smile is probably contagious right now.`,
        recommendation: '🎉 Keep this sparkle alive! Maybe dance a little, share your joy with someone, or treat yourself to something nice. You\'re basically sunshine in human form today!'
      });
    } else if (['sad', 'angry', 'fearful', 'disgusted'].includes(topEmotion.emotion)) {
      insights.push({
        type: 'concern',
        title: '🫂 Your Emotional Weather Report',
        description: `Looks like you're experiencing some ${topEmotion.emotion} clouds (${topEmotion.percentage.toFixed(1)}% of the time). Even the sun needs breaks sometimes!`,
        recommendation: '💙 Time for some self-care magic! Try the 4-7-8 breathing technique, listen to your favorite comfort song, or imagine yourself as a peaceful lake. Remember: this feeling is temporary, but you are permanent and awesome!'
      });
    } else {
      insights.push({
        type: 'neutral',
        title: '🧘 The Zen Master Mode',
        description: `You're channeling serious calm energy with ${topEmotion.percentage.toFixed(1)}% neutral vibes. Very Buddha-like of you!`,
        recommendation: '✨ You\'re perfectly balanced! Maybe it\'s time to add some pizzazz? Watch a funny video, text a friend something silly, or do a little happy dance. Life\'s too short for too much zen!'
      });
    }
  }

  // Emotion variability analysis
  const sessionMinutes = duration / (1000 * 60);
  const changeRate = sessionMinutes > 0 ? emotionChanges / sessionMinutes : 0;

  if (changeRate > 2) {
    insights.push({
      type: 'concern',
      title: '🎢 Emotional Roller Coaster Alert!',
      description: `Whoa there, speed racer! Your emotions did ${emotionChanges} outfit changes in ${sessionMinutes.toFixed(1)} minutes. That's quite the emotional wardrobe!`,
      recommendation: '🌱 Time to find your emotional anchor! Try the 5-4-3-2-1 grounding game: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It\'s like a mindfulness treasure hunt!'
    });
  } else if (changeRate < 0.5 && sessionMinutes > 2) {
    insights.push({
      type: 'neutral',
      title: '🗿 The Emotional Rock of Gibraltar',
      description: 'You\'re steady as a ship! Your emotions have been more consistent than pizza being delicious.',
      recommendation: '🎪 Stability is awesome, but variety is the spice of life! Maybe try a new playlist, watch a comedy special, or text someone a random compliment. Shake up that beautiful stability!'
    });
  }

  // Session duration insights
  if (sessionMinutes > 10) {
    insights.push({
      type: 'positive',
      title: '⏰ Time Champion Achievement Unlocked!',
      description: `Impressive! You've been in the zone for ${sessionMinutes.toFixed(1)} minutes. That's some serious dedication!`,
      recommendation: '💧 You deserve a celebration break! Stretch those arms up high, take a sip of water, and give yourself a pat on the back. Maybe do a little victory dance while you\'re at it!'
    });
  }

  // Happiness boost recommendations
  const happyPercentage = emotionPercentages.find(e => e.emotion === 'happy')?.percentage || 0;
  if (happyPercentage < 30) {
    insights.push({
      type: 'neutral',
      title: '🌈 Happiness Booster Needed!',
      description: 'Your happiness meter is running a bit low today. Time for some joy injection!',
      recommendation: '😊 Quick happiness hacks: Force a big smile for 30 seconds (it tricks your brain!), think of three things you\'re grateful for, watch baby animals on YouTube, or text someone you love. You\'ve got this, happiness warrior!'
    });
  }

  return insights;
};