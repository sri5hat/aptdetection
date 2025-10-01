// This is a server-side file!
'use server';

/**
 * @fileOverview A Genkit flow to generate a detailed incident report for a security alert.
 *
 * - generateIncidentReport - A function that generates the report.
 * - GenerateIncidentReportInput - The input type for the generateIncidentReport function.
 * - GenerateIncidentReportOutput - The return type for the generateIncidentReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { lookupThreatIntel, LookupThreatIntelOutput } from './lookup-threat-intel';

const GenerateIncidentReportInputSchema = z.object({
  alert: z.object({
    id: z.string(),
    time: z.string(),
    host: z.string(),
    alertType: z.string(),
    score: z.number(),
    mitreTactic: z.string(),
    srcIp: z.string(),
    dstIp: z.string(),
    evidence: z.string(),
    status: z.string(),
  }),
});

export type GenerateIncidentReportInput = z.infer<typeof GenerateIncidentReportInputSchema>;

const GenerateIncidentReportOutputSchema = z.object({
  report: z.string().describe('The full, formatted incident report as a single string.'),
});

export type GenerateIncidentReportOutput = z.infer<typeof GenerateIncidentReportOutputSchema>;

export async function generateIncidentReport(
  input: GenerateIncidentReportInput
): Promise<GenerateIncidentReportOutput> {
  return generateIncidentReportFlow(input);
}

// Define a tool to get threat intel for the source IP
const getThreatIntelTool = ai.defineTool(
  {
    name: 'getThreatIntelForIp',
    description: 'Gets threat intelligence information for a given IP address.',
    inputSchema: z.object({ ip: z.string() }),
    outputSchema: LookupThreatIntelOutput,
  },
  async ({ ip }) => {
    return await lookupThreatIntel({ indicator: ip });
  }
);


const prompt = ai.definePrompt({
  name: 'generateIncidentReportPrompt',
  input: { schema: GenerateIncidentReportInputSchema },
  output: { schema: GenerateIncidentReportOutputSchema },
  tools: [getThreatIntelTool],
  prompt: `You are a Tier 1 SOC Analyst responsible for writing initial incident reports.
  
  An alert has been triggered. Your task is to generate a detailed incident report based on the alert data provided.
  
  Use the 'getThreatIntelForIp' tool to enrich the source IP address ({{{alert.srcIp}}}) with threat intelligence data.
  
  Use the following template for your report. Populate all fields based on the alert data and the threat intel you look up.
  
  **Incident Report Template:**
  
  [Incident Summary]
  Title: Alert: {{{alert.alertType}}} on {{{alert.host}}}
  Date/Time: {{{alert.time}}}
  Severity: [Determine based on score: >0.85 = High, >0.6 = Medium, else = Low]
  Detection Source: ExfilSense Platform
  
  [Event Details]
  Alert ID: {{{alert.id}}}
  Host: {{{alert.host}}}
  User: [Extract from evidence if available, otherwise "N/A"]
  Source IP: {{{alert.srcIp}}}
  Destination IP: {{{alert.dstIp}}}
  MITRE ATT&CK: {{{alert.mitreTactic}}} ({{alert.alertType}})
  
  [Evidence]
  - Raw Evidence: {{{alert.evidence}}}
  - Alert Score: {{{alert.score}}}
  - Threat Intel on Source IP: [Summarize the findings from the getThreatIntelForIp tool. Mention if it's malicious and what it's known for.]
  
  [Actions Taken]
  - Alert triggered and ingested for review.
  - Threat intelligence lookup performed on source IP.
  - No automated response actions taken.
  
  [Recommendation]
  - Analyst to review the alert and associated evidence.
  - If confirmed malicious, escalate to SOC L2.
  - Consider blocking the source IP at the firewall if the activity is deemed hostile.
  
  [Escalation]
  Escalated to: SOC L1 (Pending Review)
  Ticket ID: [Leave as "Pending Triage"]
  `,
});


const generateIncidentReportFlow = ai.defineFlow(
  {
    name: 'generateIncidentReportFlow',
    inputSchema: GenerateIncidentReportInputSchema,
    outputSchema: GenerateIncidentReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
