import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SessionData } from '@/hooks/useSessionAnalytics';
import { generateEmotionInsights } from '@/utils/emotionInsights';
import { Clock, TrendingUp, RotateCcw, Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface SessionAnalyticsProps {
  sessionData: SessionData;
  isSessionActive: boolean;
  onResetSession: () => void;
}

const SessionAnalytics = ({ sessionData, isSessionActive, onResetSession }: SessionAnalyticsProps) => {
  const { duration, emotions, dominantEmotions, emotionChanges } = sessionData;
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const totalEmotions = Object.values(dominantEmotions).reduce((sum, count) => sum + count, 0);
  const emotionPercentages = Object.entries(dominantEmotions)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalEmotions > 0 ? (count / totalEmotions) * 100 : 0
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const insights = generateEmotionInsights(sessionData);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'concern':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getInsightColorClass = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'concern':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <Card className="p-6 glass-morphism border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Session Analytics
          </h3>
          <Button
            onClick={onResetSession}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{formatDuration(duration)}</p>
            <p className="text-sm text-muted-foreground">Session Duration</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{emotionChanges}</p>
            <p className="text-sm text-muted-foreground">Emotion Changes</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Emotion Distribution</h4>
          {emotionPercentages.length > 0 ? (
            emotionPercentages.map(({ emotion, percentage, count }) => (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{emotion}</span>
                  <span>{percentage.toFixed(1)}% ({count})</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No emotions detected yet
            </p>
          )}
        </div>
      </Card>

      {/* AI Insights - Only show when session is stopped */}
      <Card className="p-6 glass-morphism border-accent/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Insights & Recommendations
        </h3>

        {isSessionActive ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>AI insights will be generated when you stop the analysis session</p>
            <p className="text-sm mt-1">Stop the camera to see personalized recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColorClass(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <div className="bg-background/50 p-3 rounded border-l-4 border-primary">
                      <p className="text-sm font-medium">💡 Recommendation:</p>
                      <p className="text-sm">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Session Status */}
      <Card className="p-4 glass-morphism border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Session {isSessionActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {emotions.length} emotion readings
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default SessionAnalytics;