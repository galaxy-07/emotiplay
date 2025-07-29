import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionAnalytics';

interface EmotionChartProps {
  sessionData: SessionData;
}

const EMOTION_COLORS = {
  happy: '#10b981',     // emerald-500
  sad: '#3b82f6',       // blue-500
  angry: '#ef4444',     // red-500
  surprised: '#f59e0b', // amber-500
  fearful: '#8b5cf6',   // violet-500
  disgusted: '#06b6d4', // cyan-500
  neutral: '#6b7280'    // gray-500
};

const EmotionChart: React.FC<EmotionChartProps> = ({ sessionData }) => {
  const { dominantEmotions } = sessionData;

  // Convert emotions to chart data
  const chartData = Object.entries(dominantEmotions)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: count,
      percentage: Math.round((count / Math.max(1, Object.values(dominantEmotions).reduce((a, b) => a + b, 0))) * 100),
      color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || EMOTION_COLORS.neutral
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} detections ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 10) return null; // Don't show labels for small segments
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="glass-morphism border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Emotion Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No emotion data available</p>
            <p className="text-xs">Start analysis to see distribution</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Emotion Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {entry.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionChart;