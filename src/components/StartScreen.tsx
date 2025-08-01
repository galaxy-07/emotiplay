import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Brain, Music, Camera, Sparkles, Globe, Heart } from 'lucide-react';
import { ThemeToggle } from './ui/theme-toggle';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStart();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emotion-happy/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center max-w-4xl mx-auto px-6 transition-all duration-1000 ${
        isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}>
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                <Brain className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emotion-happy rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-emotion-sad rounded-full animate-bounce animation-delay-500"></div>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-emotion-happy bg-clip-text text-transparent mb-6 animate-fade-in">
            EmotiPlay
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience music like never before. Our AI analyzes your emotions in real-time and curates the perfect soundtrack for your mood.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 glass-morphism border-accent/30 hover:scale-105 transition-all duration-300 group">
            <Camera className="w-12 h-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Real-time Detection</h3>
            <p className="text-sm text-muted-foreground">Advanced facial recognition analyzes your emotions as they happen</p>
          </Card>
          
          <Card className="p-6 glass-morphism border-accent/30 hover:scale-105 transition-all duration-300 group">
            <Music className="w-12 h-12 text-accent mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Smart Music Curation</h3>
            <p className="text-sm text-muted-foreground">AI-powered playlist generation based on your current emotional state</p>
          </Card>
          
          <Card className="p-6 glass-morphism border-accent/30 hover:scale-105 transition-all duration-300 group">
            <Sparkles className="w-12 h-12 text-emotion-happy mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Dynamic Experience</h3>
            <p className="text-sm text-muted-foreground">Adaptive UI that changes with your mood for an immersive experience</p>
          </Card>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12 text-center">
          <div className="px-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-1">
              <Heart className="w-6 h-6" />
              7
            </div>
            <p className="text-sm text-muted-foreground">Emotions Tracked</p>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-accent mb-1">
              <Music className="w-6 h-6" />
              1000+
            </div>
            <p className="text-sm text-muted-foreground">Songs Available</p>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-emotion-happy mb-1">
              <Globe className="w-6 h-6" />
              Real-time
            </div>
            <p className="text-sm text-muted-foreground">Analysis</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleStart}
          size="lg"
          className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 transform hover:scale-105 transition-all duration-300 shadow-2xl group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
          Start Your Emotional Journey
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Please allow camera access when prompted for the best experience
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StartScreen;