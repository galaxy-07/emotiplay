import { useState, useEffect, useCallback, useRef } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  streamUrl: string;
  duration: number;
}

export interface PlaylistQueue {
  tracks: Track[];
  currentIndex: number;
}

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<PlaylistQueue>({ tracks: [], currentIndex: 0 });
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;
    
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
    
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Update progress
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio && audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 1000);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const play = useCallback(async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const loadTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.streamUrl;
      setCurrentTrack(track);
      setProgress(0);
    }
  }, []);

  const playNext = useCallback(() => {
    const nextIndex = (queue.currentIndex + 1) % queue.tracks.length;
    if (queue.tracks[nextIndex]) {
      setQueue(prev => ({ ...prev, currentIndex: nextIndex }));
      loadTrack(queue.tracks[nextIndex]);
      if (isPlaying) {
        play();
      }
    }
  }, [queue, loadTrack, play, isPlaying]);

  const playPrevious = useCallback(() => {
    const prevIndex = queue.currentIndex === 0 ? queue.tracks.length - 1 : queue.currentIndex - 1;
    if (queue.tracks[prevIndex]) {
      setQueue(prev => ({ ...prev, currentIndex: prevIndex }));
      loadTrack(queue.tracks[prevIndex]);
      if (isPlaying) {
        play();
      }
    }
  }, [queue, loadTrack, play, isPlaying]);

  const addToQueue = useCallback((tracks: Track[]) => {
    setQueue(prev => ({
      tracks: [...prev.tracks, ...tracks],
      currentIndex: prev.tracks.length === 0 ? 0 : prev.currentIndex
    }));
    
    // If no track is currently loaded, load the first new track
    if (!currentTrack && tracks.length > 0) {
      loadTrack(tracks[0]);
    }
  }, [currentTrack, loadTrack]);

  const clearQueue = useCallback(() => {
    pause();
    setQueue({ tracks: [], currentIndex: 0 });
    setCurrentTrack(null);
    setProgress(0);
  }, [pause]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const seek = useCallback((percentage: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const time = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(percentage);
    }
  }, []);

  return {
    isPlaying,
    currentTrack,
    queue,
    progress,
    volume,
    isLoading,
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
    addToQueue,
    clearQueue,
    setVolume: setVolumeLevel,
    seek
  };
};