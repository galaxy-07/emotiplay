import { useState } from 'react';
import EmotionAnalyzer from "@/components/EmotionAnalyzer";
import StartScreen from "@/components/StartScreen";

const Index = () => {
  const [showApp, setShowApp] = useState(false);

  if (!showApp) {
    return <StartScreen onStart={() => setShowApp(true)} />;
  }

  return <EmotionAnalyzer />;
};

export default Index;
