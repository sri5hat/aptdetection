'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ExplainableCompositeScoringInput, ExplainableCompositeScoringOutput } from '@/ai/flows/explainable-composite-scoring';
import { getExplanation } from '@/app/actions/scoring';
import { Alert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ScoreExplainerProps {
  alert: Alert;
}

export function ScoreExplainer({ alert }: ScoreExplainerProps) {
  const [weights, setWeights] = useState({
    ruleBasedWeight: 0.5,
    anomalyDetectionWeight: 0.3,
    supervisedClassifierWeight: 0.2,
  });
  const [result, setResult] = useState<ExplainableCompositeScoringOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runExplanation = async () => {
      setLoading(true);
      const input: ExplainableCompositeScoringInput = {
        ruleBasedScore: alert.ruleBasedScore,
        anomalyDetectionScore: alert.anomalyDetectionScore,
        supervisedClassifierScore: alert.supervisedClassifierScore,
        ruleBasedWeight: weights.ruleBasedWeight,
        anomalyDetectionWeight: weights.anomalyDetectionWeight,
        supervisedClassifierWeight: weights.supervisedClassifierWeight,
        topRuleHits: alert.topRuleHits,
        topFeatures: alert.topFeatures,
      };
      
      try {
        const explanationResult = await getExplanation(input);
        setResult(explanationResult);
      } catch (error) {
        console.error("Error getting explanation:", error);
        setResult({
            compositeScore: alert.score,
            explanation: "Could not generate an explanation at this time."
        });
      } finally {
        setLoading(false);
      }
    };
    runExplanation();
  }, [weights, alert]);

  const handleWeightChange = (type: keyof typeof weights, value: number[]) => {
    setWeights((prev) => ({ ...prev, [type]: value[0] }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div>
        <h3 className="text-md font-semibold mb-4">Score Contribution & Explainability</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust the weights of the detection models to see how they affect the composite score. This demonstrates the score fusion and explainability logic.
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
          <CardTitle>AI-Generated Explanation</CardTitle>
           <CardDescription>
            Composite score and justification from the AI model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className='flex items-baseline gap-2'>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
             result && (
              <div className="space-y-2">
                 <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-primary">{(result.compositeScore * 100).toFixed(1)}</p>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                 </div>
                 <p className="text-sm text-foreground italic">"{result.explanation}"</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
