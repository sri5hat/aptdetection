// This is a server-side file!
'use server';

/**
 * @fileOverview A Genkit flow to provide human-readable justifications for alerts based on contributing features.
 *
 * - provideAlertJustification - A function that generates a justification for an alert.
 * - ProvideAlertJustificationInput - The input type for the provideAlertJustification function.
 * - ProvideAlertJustificationOutput - The return type for the provideAlertJustification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAlertJustificationInputSchema = z.object({
  alertType: z.string().describe('The type of the alert (e.g., NetworkAnomaly, ProcessAnomaly).'),
  score: z.number().min(0).max(1).describe('The score of the alert (0 to 1).'),
  mitreTactic: z.string().describe('The MITRE ATT&CK tactic associated with the alert.'),
  evidence: z.string().describe('Short text describing the evidence for the alert.'),
  topFeatures: z
    .array(z.string())
    .describe('The top features contributing to the alert score.'),
});

export type ProvideAlertJustificationInput = z.infer<
  typeof ProvideAlertJustificationInputSchema
>;

const ProvideAlertJustificationOutputSchema = z.object({
  justification: z.string().describe('A human-readable justification for the alert.'),
});

export type ProvideAlertJustificationOutput = z.infer<
  typeof ProvideAlertJustificationOutputSchema
>;

export async function provideAlertJustification(
  input: ProvideAlertJustificationInput
): Promise<ProvideAlertJustificationOutput> {
  return provideAlertJustificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAlertJustificationPrompt',
  input: {schema: ProvideAlertJustificationInputSchema},
  output: {schema: ProvideAlertJustificationOutputSchema},
  prompt: `You are an expert security analyst providing justifications for alerts.

  You will receive information about an alert, including its type, score, MITRE ATT&CK tactic, evidence, and top contributing features.

  Your task is to provide a concise human-readable justification for the alert, highlighting the key factors that contributed most to the alert.

  Alert Type: {{{alertType}}}
  Score: {{{score}}}
  MITRE ATT&CK Tactic: {{{mitreTactic}}}
  Evidence: {{{evidence}}}
  Top Contributing Features: {{#each topFeatures}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Justification:
  `,
});

const provideAlertJustificationFlow = ai.defineFlow(
  {
    name: 'provideAlertJustificationFlow',
    inputSchema: ProvideAlertJustificationInputSchema,
    outputSchema: ProvideAlertJustificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
