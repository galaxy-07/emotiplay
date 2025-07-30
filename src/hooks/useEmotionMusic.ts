import { useEffect, useRef, useCallback } from 'react';
import { useMusicPlayer } from './useMusicPlayer';
import { audiusService } from '@/services/audiusApi';
import { useToast } from '@/hooks/use-toast';

export const useEmotionMusic = () => {
  const musicPlayer = useMusicPlayer();
  const { toast } = useToast();
  const lastEmotionRef = useRef<string | null>(null);
  const isLoadingTracksRef = useRef(false);

  const loadMusicForEmotion = useCallback(async (emotion: string, isEmotionChange: boolean = false) => {
    if (isLoadingTracksRef.current) return;
    
    try {
      isLoadingTracksRef.current = true;
      const tracks = await audiusService.getRandomTracksByMood(emotion, 3);
      
      if (tracks.length > 0) {
        if (isEmotionChange) {
          // If emotion changed mid-song, add to queue
          musicPlayer.addToQueue(tracks);
          toast({
            title: `Emotion changed to ${emotion}`,
            description: `Added ${tracks.length} songs to queue`,
          });
        } else {
          // If starting fresh, replace queue and auto-play
          musicPlayer.clearQueue();
          musicPlayer.addToQueue(tracks);
          
          // Auto-play after tracks are added
          setTimeout(() => {
            musicPlayer.play();
          }, 1000);
          
          toast({
            title: `Playing music for ${emotion} mood`,
            description: `Loaded ${tracks.length} songs`,
          });
        }
      } else {
        toast({
          title: "No music found",
          description: `Couldn't find music for ${emotion} mood`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load music for emotion:', error);
      toast({
        title: "Music loading failed",
        description: "Unable to load music. Please try again.",
        variant: "destructive"
      });
    } finally {
      isLoadingTracksRef.current = false;
    }
  }, [musicPlayer, toast]);

  const handleEmotionChange = useCallback((emotion: string, confidence: number) => {
    // Only process emotions with high confidence
    if (confidence < 60) return;

    const isEmotionChange = lastEmotionRef.current && lastEmotionRef.current !== emotion;
    
    if (!lastEmotionRef.current) {
      // First emotion detected - load initial music
      loadMusicForEmotion(emotion, false);
    } else if (isEmotionChange) {
      // Emotion changed - add to queue
      loadMusicForEmotion(emotion, true);
    }
    
    lastEmotionRef.current = emotion;
  }, [loadMusicForEmotion]);

  const resetMusicSession = useCallback(() => {
    musicPlayer.clearQueue();
    lastEmotionRef.current = null;
  }, [musicPlayer]);

  // Get current emotion for background theming
  const getCurrentEmotion = useCallback(() => {
    return lastEmotionRef.current;
  }, []);

  return {
    ...musicPlayer,
    handleEmotionChange,
    resetMusicSession,
    getCurrentEmotion
  };
};