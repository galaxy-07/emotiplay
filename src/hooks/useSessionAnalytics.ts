import { useState, useEffect, useCallback, useRef } from 'react';

export interface EmotionEntry {
  emotion: string;
  confidence: number;
  timestamp: number;
}

export interface SessionData {
  startTime: number;
  duration: number;
  emotions: EmotionEntry[];
  dominantEmotions: Record<string, number>;
  emotionChanges: number;
}

export const useSessionAnalytics = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: 0,
    duration: 0,
    emotions: [],
    dominantEmotions: {},
    emotionChanges: 0
  });
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmotionRef = useRef<string | null>(null);

  const startSession = useCallback(() => {
    const now = Date.now();
    setSessionData({
      startTime: now,
      duration: 0,
      emotions: [],
      dominantEmotions: {},
      emotionChanges: 0
    });
    setIsSessionActive(true);
    lastEmotionRef.current = null;

    // Update duration every second
    intervalRef.current = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        duration: Date.now() - prev.startTime
      }));
    }, 1000);
  }, []);

  const stopSession = useCallback(() => {
    setIsSessionActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const addEmotionEntry = useCallback((emotion: string, confidence: number) => {
    if (!isSessionActive) return;

    const entry: EmotionEntry = {
      emotion,
      confidence,
      timestamp: Date.now()
    };

    setSessionData(prev => {
      const newEmotions = [...prev.emotions, entry];
      const newDominantEmotions = { ...prev.dominantEmotions };
      newDominantEmotions[emotion] = (newDominantEmotions[emotion] || 0) + 1;

      let emotionChanges = prev.emotionChanges;
      // Only count as change if it's different from last emotion and confidence > 50%
      if (lastEmotionRef.current && lastEmotionRef.current !== emotion && confidence > 50) {
        emotionChanges++;
      }
      
      // Only update lastEmotion if confidence is high enough to be meaningful
      if (confidence > 50) {
        lastEmotionRef.current = emotion;
      }

      return {
        ...prev,
        emotions: newEmotions,
        dominantEmotions: newDominantEmotions,
        emotionChanges
      };
    });
  }, [isSessionActive]);

  const resetSession = useCallback(() => {
    stopSession();
    setSessionData({
      startTime: 0,
      duration: 0,
      emotions: [],
      dominantEmotions: {},
      emotionChanges: 0
    });
    lastEmotionRef.current = null;
  }, [stopSession]);

  // Reset session on page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      resetSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetSession]);

  return {
    sessionData,
    isSessionActive,
    startSession,
    stopSession,
    resetSession,
    addEmotionEntry
  };
};