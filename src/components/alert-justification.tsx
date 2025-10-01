
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { getJustification } from '@/app/actions/justification';
import { ProvideAlertJustificationInput, ProvideAlertJustificationOutput } from '@/ai/flows/provide-alert-justification';
import type { Alert } from '@/lib/types';
import { Lightbulb } from 'lucide-react';

interface AlertJustificationProps {
    alert: Alert;
}

export function AlertJustification({ alert }: AlertJustificationProps) {
    const [result, setResult] = useState<ProvideAlertJustificationOutput | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const runJustification = async () => {
            setLoading(true);
            const input: ProvideAlertJustificationInput = {
                alertType: alert.alertType,
                score: alert.score,
                mitreTactic: alert.mitreTactic,
                evidence: alert.evidence,
                topFeatures: alert.topFeatures,
            };

            try {
                const justificationResult = await getJustification(input);
                setResult(justificationResult);
            } catch (error) {
                console.error("Error getting justification:", error);
                setResult({
                    justification: "Could not generate an AI justification for this alert."
                });
            } finally {
                setLoading(false);
            }
        };
        runJustification();
    }, [alert]);

    return (
        <Card className="bg-muted/30 border-primary/20">
            <CardHeader className='p-4'>
                <div className='flex items-center gap-3'>
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <div className='flex flex-col'>
                     <CardTitle className="text-lg text-primary">AI Generated Justification</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
                {loading ? (
                    <Skeleton className="h-5 w-full" />
                ) : (
                    result && (
                        <p className="text-sm text-foreground">
                            {result.justification}
                        </p>
                    )
                )}
            </CardContent>
        </Card>
    );
}
