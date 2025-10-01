// This is a server-side file!
'use server';

/**
 * @fileOverview A Genkit flow to simulate looking up threat intelligence for an indicator.
 *
 * - lookupThreatIntel - A function that simulates a threat intel lookup.
 * - LookupThreatIntelInput - The input type for the lookupThreatIntel function.
 * - LookupThreatIntelOutput - The return type for the lookupThreatIntel function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LookupThreatIntelInputSchema = z.object({
  indicator: z.string().describe('The indicator to look up (IP, domain, hash).'),
});

export type LookupThreatIntelInput = z.infer<typeof LookupThreatIntelInputSchema>;

const LookupThreatIntelOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether the indicator is considered malicious.'),
  knownFor: z.array(z.string()).describe('A list of threat categories the indicator is associated with (e.g., Brute Force, C2, Malware).'),
  reportSummary: z.string().describe('A short, one-sentence summary of the threat intelligence findings.'),
});

export type LookupThreatIntelOutput = z.infer<typeof LookupThreatIntelOutputSchema>;

export async function lookupThreatIntel(
  input: LookupThreatIntelInput
): Promise<LookupThreatIntelOutput> {
  return lookupThreatIntelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lookupThreatIntelPrompt',
  input: { schema: LookupThreatIntelInputSchema },
  output: { schema: LookupThreatIntelOutputSchema },
  prompt: `You are a threat intelligence provider.
  You are given an indicator (IP address, domain, or file hash).
  Based on the indicator, you need to generate a realistic but FAKE threat intelligence report.

  - If the indicator looks like a test, private, or example IP/domain (e.g., 10.0.0.x, 192.168.x.x, example.com, 127.0.0.1, 93.184.216.34), report it as non-malicious.
  - For IPs like '185.199.108.153' (transfer.sh) or domains like 'c2-server-blog.com', flag them as malicious and related to exfiltration or C2.
  - For other public-looking IPs or domains, randomly decide if it is malicious. If malicious, invent some plausible threat activity (e.g., Brute Force, Phishing Host, Malware C2).

  Indicator: {{{indicator}}}
  `,
});

const lookupThreatIntelFlow = ai.defineFlow(
  {
    name: 'lookupThreatIntelFlow',
    inputSchema: LookupThreatIntelInputSchema,
    outputSchema: LookupThreatIntelOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
