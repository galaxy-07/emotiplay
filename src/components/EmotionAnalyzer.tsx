import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Activity, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import SessionAnalytics from './SessionAnalytics';
import MusicPlayer, { MusicPlayerRef } from './MusicPlayer';
interface EmotionData {
  expression: string;
  confidence: number;
  color: string;
}
interface FaceExpressions {
  angry: number;
  disgusted: number;
  fearful: number;
  happy: number;
  neutral: number;
  sad: number;
  surprised: number;
}
const EmotionAnalyzer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [dominantEmotion, setDominantEmotion] = useState<EmotionData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const musicPlayerRef = useRef<MusicPlayerRef>(null);
  const { toast } = useToast();
  
  // Session analytics
  const {
    sessionData,
    isSessionActive,
    startSession,
    stopSession,
    resetSession,
    addEmotionEntry
  } = useSessionAnalytics();
  const emotionColors: Record<string, string> = {
    happy: 'emotion-happy',
    sad: 'emotion-sad',
    angry: 'emotion-angry',
    surprised: 'emotion-surprised',
    fearful: 'emotion-fearful',
    disgusted: 'emotion-disgusted',
    neutral: 'emotion-neutral'
  };
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const modelPath = '/models';
      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(modelPath), faceapi.nets.faceLandmark68Net.loadFromUri(modelPath), faceapi.nets.faceRecognitionNet.loadFromUri(modelPath), faceapi.nets.faceExpressionNet.loadFromUri(modelPath)]);
      setModelsLoaded(true);
      toast({
        title: "Models loaded successfully",
        description: "Face detection and emotion recognition models are ready"
      });
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error loading models",
        description: "Failed to load face detection models. Using face-api.js CDN fallback...",
        variant: "destructive"
      });

      // Fallback to CDN
      try {
        await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'), faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'), faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'), faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model')]);
        setModelsLoaded(true);
        toast({
          title: "Models loaded from CDN",
          description: "Face detection models loaded successfully"
        });
      } catch (cdnError) {
        console.error('CDN fallback failed:', cdnError);
        toast({
          title: "Failed to load models",
          description: "Cannot load face detection models. Please refresh and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280
          },
          height: {
            ideal: 720
          },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast({
        title: "Camera started",
        description: "Video feed is now active"
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use emotion analysis",
        variant: "destructive"
      });
    }
  }, [toast]);
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnalyzing(false);
    setEmotions([]);
    setDominantEmotion(null);
    toast({
      title: "Camera stopped",
      description: "Video feed has been stopped"
    });
  }, [stream, toast]);

  const handleEmotionDetected = useCallback((emotion: string, confidence: number) => {
    musicPlayerRef.current?.handleEmotionChange(emotion, confidence);
  }, []);

  const analyzeEmotions = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (detections.length > 0) {
        // Draw detections
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);

        // Get expressions from first face
        const expressions = detections[0].expressions as FaceExpressions;

        // Convert to array and sort by confidence
        const emotionArray: EmotionData[] = Object.entries(expressions).map(([emotion, confidence]) => ({
          expression: emotion,
          confidence: Math.round(confidence * 100),
          color: emotionColors[emotion] || 'emotion-neutral'
        })).sort((a, b) => b.confidence - a.confidence);
        setEmotions(emotionArray);
        setDominantEmotion(emotionArray[0]);
        
        // Add to session analytics and trigger music change
        if (emotionArray[0]) {
          addEmotionEntry(emotionArray[0].expression, emotionArray[0].confidence);
          handleEmotionDetected(emotionArray[0].expression, emotionArray[0].confidence);
        }
      } else {
        setEmotions([]);
        setDominantEmotion(null);
      }
    } catch (error) {
      console.error('Error analyzing emotions:', error);
    }
  }, [modelsLoaded, emotionColors, addEmotionEntry, handleEmotionDetected]);
  const toggleAnalysis = useCallback(() => {
    if (isAnalyzing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsAnalyzing(false);
      stopSession();
      toast({
        title: "Analysis stopped",
        description: "Emotion analysis has been paused"
      });
    } else {
      if (modelsLoaded && stream) {
        intervalRef.current = setInterval(analyzeEmotions, 500); // Analyze every 500ms
        setIsAnalyzing(true);
        startSession();
        toast({
          title: "Analysis started",
          description: "Real-time emotion analysis is now active"
        });
      }
    }
  }, [isAnalyzing, modelsLoaded, stream, analyzeEmotions, toast, startSession, stopSession]);

  const handleSessionReset = useCallback(() => {
    resetSession();
    musicPlayerRef.current?.resetMusicSession();
  }, [resetSession]);
  useEffect(() => {
    loadModels();
  }, [loadModels]);
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  // Get current emotion for dynamic background
  const currentEmotion = musicPlayerRef.current?.getCurrentEmotion?.() || dominantEmotion?.expression;
  const emotionBgClass = currentEmotion ? `emotion-bg-${currentEmotion}` : '';

  return <div className={`min-h-screen bg-background p-6 pb-32 ${emotionBgClass}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Emotion-Driven Music Experience
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time emotion detection with personalized music recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="xl:col-span-2">
            <Card className="p-6 glass-morphism border-accent/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Live Feed
                </h2>
                
                <div className="flex gap-2">
                  {!stream ? <Button onClick={startCamera} disabled={isLoading} className="bg-primary hover:bg-primary/80">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button> : <Button onClick={stopCamera} variant="destructive">
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>}
                  
                  <Button onClick={toggleAnalysis} disabled={!stream || !modelsLoaded} variant={isAnalyzing ? "secondary" : "default"} className={isAnalyzing ? "emotion-pulse" : ""}>
                    <Brain className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
                  </Button>
                </div>
              </div>

              {/* Video Container */}
              <div className="relative rounded-lg overflow-hidden bg-card">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto max-h-[500px] object-cover" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                
                {/* Overlay Status */}
                {dominantEmotion && <div className="absolute top-4 left-4">
                    <Badge className={`emotion-glow text-lg px-4 py-2 border-none`} style={{
                  backgroundColor: `hsl(var(--${dominantEmotion.color}))`,
                  color: 'white'
                }}>
                      {dominantEmotion.expression.toUpperCase()} {dominantEmotion.confidence}%
                    </Badge>
                  </div>}

                {/* Loading State */}
                {isLoading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Loading AI models...</p>
                    </div>
                  </div>}
              </div>

              {/* Status Indicators */}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Models {modelsLoaded ? 'Loaded' : 'Loading'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stream ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Camera {stream ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>Analysis {isAnalyzing ? 'Running' : 'Stopped'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Emotion Dashboard */}
          <div className="space-y-6">
            {/* Dominant Emotion */}
            <Card className="p-6 glass-morphism border-accent/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Current Emotion
              </h3>
              
              {dominantEmotion ? <div className="text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold emotion-pulse" style={{
                backgroundColor: `hsl(var(--${dominantEmotion.color}) / 0.2)`,
                border: `2px solid hsl(var(--${dominantEmotion.color}))`
              }}>
                    {dominantEmotion.confidence}%
                  </div>
                  <h4 className="text-2xl font-bold capitalize mb-2">
                    {dominantEmotion.expression}
                  </h4>
                  <p className="text-muted-foreground">
                    Confidence: {dominantEmotion.confidence}%
                  </p>
                </div> : <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center">
                    <Brain className="w-8 h-8" />
                  </div>
                  <p>No face detected</p>
                </div>}
            </Card>

            {/* Emotion Breakdown */}
            <Card className="p-6 glass-morphism border-accent/20">
              <h3 className="text-xl font-semibold mb-4">Emotion Analysis</h3>
              
              <div className="space-y-3">
                {emotions.length > 0 ? emotions.map(emotion => <div key={emotion.expression} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">
                        {emotion.expression}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {emotion.confidence}%
                      </span>
                    </div>
                    <Progress value={emotion.confidence} className="h-2" style={{
                  '--progress-background': `hsl(var(--${emotion.color}))`
                } as React.CSSProperties} />
                  </div>) : <p className="text-muted-foreground text-center py-8">
                    Start analysis to see emotion breakdown
                  </p>}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <SessionAnalytics
              sessionData={sessionData}
              isSessionActive={isSessionActive}
              onResetSession={resetSession}
            />
          </div>
        </div>

        {/* Music Player - Fixed at bottom for easy access */}
        <div className="fixed bottom-6 right-6 left-6 xl:left-auto xl:w-96 z-50">
          <MusicPlayer ref={musicPlayerRef} className="shadow-2xl" />
        </div>
      </div>
    </div>;
};
export default EmotionAnalyzer;