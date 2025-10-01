'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { type Alert } from '@/lib/types';
import { ScoreExplainer } from './score-explainer';
import { ReactNode, useEffect, useState } from 'react';
import { Download, Lightbulb, Bot } from 'lucide-react';
import { getIncidentReport } from '@/app/actions/report';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface AlertDetailModalProps {
  alert: Alert;
  children: ReactNode;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
}

export function AlertDetailModal({ alert, children, updateAlertStatus }: AlertDetailModalProps) {
  const [isClient, setIsClient] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [justification, setJustification] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      setReport(null);
      setJustification(null);
      try {
        const { report, justification } = await getIncidentReport({ alert });
        setReport(report);
        setJustification(justification);
      } catch (error) {
        console.error("Failed to generate report:", error);
        setJustification("Could not generate an AI justification for this alert.");
        setReport("Failed to generate incident report.");
      } finally {
        setIsGeneratingReport(false);
      }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${alert.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Alert Details: {alert.id}</DialogTitle>
          <DialogDescription>
            Detailed analysis of the detected threat event from {alert.host}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Card className="bg-muted/30 border-primary/20">
            <CardHeader className='p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Lightbulb className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg text-primary">AI Generated Justification</CardTitle>
                    </div>
                     <Button size="sm" variant="ghost" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                        <Bot className="mr-2 h-4 w-4" />
                        {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                    </Button>
                </div>
            </CardHeader>
             {isGeneratingReport && (
                <CardContent className='p-4 pt-0 space-y-2'>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            )}
            {justification && (
                 <CardContent className='p-4 pt-0'>
                    <p className="text-sm text-foreground">
                        {justification}
                    </p>
                </CardContent>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="font-mono text-sm">{isClient ? new Date(alert.time).toLocaleString() : new Date(alert.time).toISOString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Host</p>
              <p className="text-sm">{alert.host}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Source IP</p>
              <p className="text-sm">{alert.srcIp}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Destination IP</p>
              <p className="text-sm">{alert.dstIp}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Alert Type</p>
              <Badge variant="outline">{alert.alertType}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">MITRE Tactic</p>
              <p className="text-sm">{alert.mitreTactic}</p>
            </div>
             <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={alert.status === 'New' ? 'destructive' : alert.status === 'Investigating' ? 'secondary' : 'default'}>{alert.status}</Badge>
            </div>
             <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Score</p>
              <Badge variant={alert.score > 0.85 ? 'destructive' : alert.score > 0.6 ? 'secondary' : 'default'}>{alert.score.toFixed(2)}</Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Evidence</p>
            <p className="text-sm font-mono bg-muted p-2 rounded-md">{alert.evidence}</p>
          </div>
          
          <Separator />
          
          <ScoreExplainer alert={alert} />

          <Separator />
          
          <div>
            <h3 className="text-md font-semibold mb-2">Analyst Notes</h3>
            <Textarea placeholder="Add investigation notes here..." rows={4} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
           <Button variant="secondary" onClick={handleDownloadReport} disabled={!report}>
              <Download className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => updateAlertStatus(alert.id, 'Investigating')}>Mark as Investigating</Button>
            <Button onClick={() => updateAlertStatus(alert.id, 'Resolved')}>Resolve Alert</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
