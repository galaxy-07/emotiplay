import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionAnalytics';
import { Clock, TrendingUp, RotateCcw } from 'lucide-react';

interface SessionAnalyticsProps {
  sessionData: SessionData;
  isSessionActive: boolean;
  onResetSession: () => void;
}

const SessionAnalytics = ({
  sessionData,
  isSessionActive,
  onResetSession
}: SessionAnalyticsProps) => {
  const { duration } = sessionData;

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

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <Card className="p-4 glass-morphism border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Session Analytics
          </h3>
          <Button onClick={onResetSession} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>

        {/* Session Duration */}
        <div className="text-center p-3 rounded-lg bg-muted/50 mb-4">
          <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold">{formatDuration(duration)}</p>
          <p className="text-xs text-muted-foreground">Session Duration</p>
        </div>

        {/* Session Status */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/30">
          <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            Session {isSessionActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default SessionAnalytics;