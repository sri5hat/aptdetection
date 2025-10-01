'use server';

import { provideAlertJustification, ProvideAlertJustificationInput, ProvideAlertJustificationOutput } from '@/ai/flows/provide-alert-justification';

export async function getJustification(input: ProvideAlertJustificationInput): Promise<ProvideAlertJustificationOutput> {
    return await provideAlertJustification(input);
}
