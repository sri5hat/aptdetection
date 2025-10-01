'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ScoreExplainerProps {
  alert: Alert;
}

export function ScoreExplainer({ alert }: ScoreExplainerProps) {
  const [weights, setWeights] = useState({
    ruleBasedWeight: 0.5,
    anomalyDetectionWeight: 0.3,
    supervisedClassifierWeight: 0.2,
  });
  const [compositeScore, setCompositeScore] = useState(alert.score);

  useEffect(() => {
    const newCompositeScore =
      weights.ruleBasedWeight * alert.ruleBasedScore +
      weights.anomalyDetectionWeight * alert.anomalyDetectionScore +
      weights.supervisedClassifierWeight * alert.supervisedClassifierScore;
    
    const normalizedCompositeScore = Math.min(1, Math.max(0, newCompositeScore));
    setCompositeScore(normalizedCompositeScore);
  }, [weights, alert]);

  const handleWeightChange = (type: keyof typeof weights, value: number[]) => {
    setWeights((prev) => ({ ...prev, [type]: value[0] }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div>
        <h3 className="text-md font-semibold mb-4">Score Contribution Simulator</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust the weights of the detection models to see how they affect the composite score. This demonstrates the score fusion logic.
        </p>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="rule-slider">Rule-Based Heuristics</Label>
              <span className="font-mono text-sm">{weights.ruleBasedWeight.toFixed(2)}</span>
            </div>
            <Slider
              id="rule-slider"
              min={0}
              max={1}
              step={0.05}
              value={[weights.ruleBasedWeight]}
              onValueChange={(v) => handleWeightChange('ruleBasedWeight', v)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="anomaly-slider">Anomaly Detection (UCL)</Label>
               <span className="font-mono text-sm">{weights.anomalyDetectionWeight.toFixed(2)}</span>
            </div>
            <Slider
              id="anomaly-slider"
              min={0}
              max={1}
              step={0.05}
              value={[weights.anomalyDetectionWeight]}
              onValueChange={(v) => handleWeightChange('anomalyDetectionWeight', v)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="classifier-slider">Supervised Classifier</Label>
               <span className="font-mono text-sm">{weights.supervisedClassifierWeight.toFixed(2)}</span>
            </div>
            <Slider
              id="classifier-slider"
              min={0}
              max={1}
              step={0.05}
              value={[weights.supervisedClassifierWeight]}
              onValueChange={(v) => handleWeightChange('supervisedClassifierWeight', v)}
            />
          </div>
        </div>
      </div>
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Simulated Composite Score</CardTitle>
           <CardDescription>
            The recalculated score based on your weight adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-primary">{(compositeScore * 100).toFixed(1)}</p>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <p className="text-sm text-foreground italic">"Original alert score was {alert.score.toFixed(2)}."</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
