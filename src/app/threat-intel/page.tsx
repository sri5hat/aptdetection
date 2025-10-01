
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

const MOCK_FEEDS = [
  {
    name: "AlienVault OTX",
    type: "OTX",
    url: "https://otx.alienvault.com/api/v1/pulses/subscribed",
    status: "Active",
    lastUpdated: "2025-09-29T10:00:00Z",
  },
  {
    name: "CISA Known Exploited",
    type: "CSV",
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog/downloads/known_exploited_vulnerabilities.csv",
    status: "Active",
    lastUpdated: "2025-09-28T23:00:00Z",
  },
  {
    name: "MISP Community Feed",
    type: "MISP",
    url: "https://www.misp-project.org/feeds/",
    status: "Inactive",
    lastUpdated: "2025-09-20T12:00:00Z",
  },
];

export default function ThreatIntelPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Threat Intelligence Feeds</h1>
        <p className="text-muted-foreground">
          Integrate and manage external threat intelligence sources.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Feed</CardTitle>
              <CardDescription>
                Connect a new intelligence source to enrich your alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feed-name">Feed Name</Label>
                <Input id="feed-name" placeholder="e.g., CISA Known Exploited" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-url">Feed URL</Label>
                <Input id="feed-url" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-type">Feed Type</Label>
                <Select>
                  <SelectTrigger id="feed-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stix-taxii">STIX/TAXII</SelectItem>
                    <SelectItem value="misp">MISP</SelectItem>
                    <SelectItem value="otx">OTX</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-frequency">Update Frequency</Label>
                <Select>
                  <SelectTrigger id="update-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Feed
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Feeds</CardTitle>
              <CardDescription>
                List of currently integrated intelligence feeds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_FEEDS.map((feed) => (
                    <TableRow key={feed.name}>
                      <TableCell className="font-medium">{feed.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feed.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {feed.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isClient ? new Date(feed.lastUpdated).toLocaleString() : new Date(feed.lastUpdated).toISOString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
