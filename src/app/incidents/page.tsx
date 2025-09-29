
'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { type AlertStatus } from '@/lib/types';

type IncidentStatus = 'Open' | 'Under Investigation' | 'Closed';

interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  alerts: number;
  lastActivity: string;
  assignee: string;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    title: 'Data Exfiltration via Cloud Storage',
    status: 'Under Investigation',
    alerts: 2,
    lastActivity: '2025-09-29T12:05:00Z',
    assignee: 'j. doe',
  },
  {
    id: 'INC-002',
    title: 'Suspicious PowerShell on WIN-CLIENT-01',
    status: 'Open',
    alerts: 1,
    lastActivity: '2025-09-29T11:48:02Z',
    assignee: 'Unassigned',
  },
   {
    id: 'INC-003',
    title: 'Potential Lateral Movement from DB-SERVER-01',
    status: 'Closed',
    alerts: 3,
    lastActivity: '2025-09-29T11:40:12Z',
    assignee: 's. analyst',
  },
];

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

    const getStatusBadgeVariant = (status: IncidentStatus) => {
        switch (status) {
            case 'Open':
                return 'destructive';
            case 'Under Investigation':
                return 'secondary';
            case 'Closed':
                return 'default';
        }
    }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            Grouped alerts for tracking ongoing security investigations.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Incident
            </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Assignee</TableHead>
                 <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(incident.status)}>{incident.status}</Badge>
                  </TableCell>
                  <TableCell>{incident.alerts}</TableCell>
                  <TableCell>{new Date(incident.lastActivity).toLocaleString()}</TableCell>
                  <TableCell>{incident.assignee}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                        View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {incidents.length === 0 && (
                <div className="flex justify-center items-center py-10 text-muted-foreground">
                    No incidents found.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
