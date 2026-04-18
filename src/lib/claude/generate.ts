// Fonctions high-level pour interagir avec Claude
import { anthropic, MODEL_DEFAULT } from './client';
import { buildRelancePrompt, buildQAPrompt, type DossierContext } from './prompts';

export type RelanceOutput = {
  subject?: string;
  body: string;
};

export type QAOutput = {
  answer: string;
  latency_ms: number;
};

/**
 * Génère une relance client (email ou WhatsApp)
 */
export async function generateRelance(
  dossier: DossierContext,
  missing: string[],
  channel: 'email' | 'whatsapp'
): Promise<RelanceOutput> {
  const prompt = buildRelancePrompt(dossier, missing, channel);

  const response = await anthropic.messages.create({
    model: MODEL_DEFAULT,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block: any) => block.text)
    .join('')
    .trim();

  // Parse JSON (Claude peut parfois envelopper dans ```json…)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude response is not valid JSON: ' + text.slice(0, 200));
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error('Failed to parse Claude JSON: ' + (e as Error).message);
  }
}

/**
 * Répond à une question sur un dossier
 */
export async function answerDossierQuestion(
  question: string,
  contextDocs: string[]
): Promise<QAOutput> {
  const t0 = Date.now();
  const prompt = buildQAPrompt(question, contextDocs);

  const response = await anthropic.messages.create({
    model: MODEL_DEFAULT,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const answer = response.content
    .filter((block) => block.type === 'text')
    .map((block: any) => block.text)
    .join('')
    .trim();

  return {
    answer,
    latency_ms: Date.now() - t0,
  };
}
