'use client';

import { useState, useEffect, useRef } from 'react';
import { PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    const eventSource = new EventSource('/api/logs/stream');
    eventSource.onmessage = (event) => {
      const newLog = event.data;
      setLogs((prevLogs) => {
        const updatedLogs = [newLog, ...prevLogs];
        // Limit the number of logs to prevent performance issues
        if (updatedLogs.length > 200) {
          return updatedLogs.slice(0, 200);
        }
        return updatedLogs;
      });
    };
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isLive]);

  useEffect(() => {
    // Scroll to the top when new logs arrive if already at the top
    if (logsContainerRef.current && logsContainerRef.current.scrollTop < 50) {
        logsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [logs]);

  const getLogColor = (log: string) => {
    if (log.includes('CRITICAL') || log.includes('exfiltration')) {
      return 'text-red-500';
    }
    if (log.includes('WARNING') || log.includes('anomaly')) {
      return 'text-yellow-500';
    }
    if (log.includes('powershell')) {
        return 'text-blue-400';
    }
    return 'text-foreground';
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Log Monitoring</h1>
          <p className="text-muted-foreground">
            Live stream of simulated security logs to detect threats.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="w-[110px]"
          >
            {isLive ? (
              <PauseCircle className="mr-2 h-4 w-4" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {isLive ? 'Streaming' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Logs
          </Button>
        </div>
      </div>
      <Card>
        <CardContent 
          className="p-0"
          ref={logsContainerRef}>
          <div 
            ref={logsContainerRef}
            className="h-[65vh] overflow-y-auto bg-card rounded-lg p-4 font-mono text-xs">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={`${log}-${index}`} // Key needs to be unique for animation
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`whitespace-pre-wrap ${getLogColor(log)}`}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    {isLive ? "Waiting for log entries..." : "Log streaming is paused."}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}