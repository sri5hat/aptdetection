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
import { AlertJustification } from './alert-justification';
import { Download } from 'lucide-react';
import { getIncidentReport } from '@/app/actions/report';

interface AlertDetailModalProps {
  alert: Alert;
  children: ReactNode;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
}

export function AlertDetailModal({ alert, children, updateAlertStatus }: AlertDetailModalProps) {
  const [isClient, setIsClient] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    try {
      const { report } = await getIncidentReport({ alert });
      
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-report-${alert.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to generate report:", error);
      // You could show a toast notification here
    } finally {
      setIsGeneratingReport(false);
    }
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
           <AlertJustification alert={alert} />

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
           <Button variant="secondary" onClick={handleDownloadReport} disabled={isGeneratingReport}>
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingReport ? 'Generating...' : 'Download Report'}
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
