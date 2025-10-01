'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { getThreatIntel } from '../actions/threat-intel';
import type { LookupThreatIntelOutput } from '@/ai/flows/lookup-threat-intel';
import { Skeleton } from '@/components/ui/skeleton';

export default function ThreatIntelPage() {
  const [indicator, setIndicator] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupThreatIntelOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!indicator) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await getThreatIntel({ indicator });
      setResult(res);
    } catch (e) {
      setError('Failed to fetch threat intelligence. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Threat Intelligence Lookup</h1>
        <p className="text-muted-foreground">
          Enrich indicators of compromise (IOCs) using AI-powered threat
          intelligence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicator Search</CardTitle>
          <CardDescription>
            Enter an IP address, domain, or file hash to look up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., 185.220.101.35 or suspicious-domain.com"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              Intel Report for{' '}
              <span className="font-mono text-primary">{indicator}</span>
            </CardTitle>
            <CardDescription>{result.reportSummary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Malicious Status</h3>
              <Badge variant={result.isMalicious ? 'destructive' : 'default'}>
                {result.isMalicious ? 'MALICIOUS' : 'NOT MALICIOUS'}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold">Known For</h3>
              {result.knownFor.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.knownFor.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specific threat categories associated with this indicator.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
