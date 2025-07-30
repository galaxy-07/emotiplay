import React, { forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Music,
  ListMusic,
  Loader2
} from 'lucide-react';
import { useEmotionMusic } from '@/hooks/useEmotionMusic';

interface MusicPlayerProps {
  className?: string;
}

export interface MusicPlayerRef {
  handleEmotionChange: (emotion: string, confidence: number) => void;
  resetMusicSession: () => void;
  getCurrentEmotion: () => string | null;
}

const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(({ className }, ref) => {
  const {
    isPlaying,
    currentTrack,
    queue,
    progress,
    volume,
    isLoading,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    seek,
    playTrackFromQueue,
    handleEmotionChange,
    resetMusicSession,
    getCurrentEmotion
  } = useEmotionMusic();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleEmotionChange,
    resetMusicSession,
    getCurrentEmotion
  }), [handleEmotionChange, resetMusicSession, getCurrentEmotion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  return (
    <Card className={`w-full backdrop-blur-md bg-card/95 border-accent/30 ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Emotion Music Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Track Display */}
        <div className="bg-gradient-to-r from-background/50 to-accent/10 p-4 rounded-lg">
          {currentTrack ? (
            <div className="flex items-center gap-3">
              {currentTrack.artwork && (
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{currentTrack.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No track selected</p>
              <p className="text-xs">Start emotion detection to auto-play music</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {currentTrack && (
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime((progress / 100) * (currentTrack.duration || 0))}</span>
              <span>{formatTime(currentTrack.duration || 0)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={playPrevious}
            disabled={queue.tracks.length === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlayPause}
            disabled={!currentTrack || isLoading}
            className="h-12 w-12"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={playNext}
            disabled={queue.tracks.length === 0}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>

        {/* Queue Display */}
        {queue.tracks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              <span className="text-sm font-medium">Queue ({queue.tracks.length})</span>
            </div>
            <ScrollArea className="h-32 w-full">
              <div className="space-y-1">
                {queue.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playTrackFromQueue(index)}
                    className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer hover:bg-muted/50 transition-colors ${
                      index === queue.currentIndex 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30'
                    }`}
                  >
                    {track.artwork && (
                      <img 
                        src={track.artwork} 
                        alt={track.title}
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{track.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                    {index === queue.currentIndex && (
                      <Badge variant="secondary" className="text-xs">
                        {isPlaying ? 'Playing' : 'Current'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MusicPlayer.displayName = 'MusicPlayer';

export default MusicPlayer;