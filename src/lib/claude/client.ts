// Client Anthropic Claude
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Modèles (voir https://docs.claude.com/en/docs/about-claude/models)
export const MODEL_DEFAULT = 'claude-sonnet-4-6';
export const MODEL_FAST = 'claude-haiku-4-5-20251001';
export const MODEL_BEST = 'claude-opus-4-6';
