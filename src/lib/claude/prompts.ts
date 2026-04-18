// Prompts Claude pour CabiPilot
// Garder ces prompts versionnés — ils sont le cœur de la qualité produit

export type DossierContext = {
  client_name: string;
  regime_fiscal?: string;
  secteur?: string;
};

/**
 * Prompt pour générer une relance client (email ou WhatsApp)
 */
export function buildRelancePrompt(
  dossier: DossierContext,
  missing: string[],
  channel: 'email' | 'whatsapp'
): string {
  const channelInstructions = channel === 'email'
    ? `Email : 80 à 150 mots. Retourne un objet JSON avec "subject" (objet court, max 60 caractères, sans emoji) et "body" (corps de l'email). Pas d'emoji. Ton professionnel et direct. Tutoiement formel ("vous"). Signer "[Prénom collab], Cabinet Martin & Associés".`
    : `WhatsApp : 40 à 80 mots. Ton plus direct/casual. Bullet points OK avec le caractère •. Maximum 2 emojis pertinents (type 🙏 ⏰). Tutoiement formel. Signature courte "[Prénom]". Retourne un objet JSON avec "body" (pas de "subject" pour WhatsApp).`;

  return `Tu es l'assistant IA d'un cabinet d'expertise comptable français.
Tu dois rédiger une relance ${channel.toUpperCase()} envoyée AU CLIENT du cabinet (le client est le dirigeant de la PME).

# CONTEXTE CLIENT
- Nom de l'entreprise cliente : ${dossier.client_name}
- Régime fiscal : ${dossier.regime_fiscal || 'non précisé'}
- Secteur : ${dossier.secteur || 'non précisé'}
- Relation : client du cabinet, relation professionnelle établie

# ÉLÉMENTS MANQUANTS À DEMANDER AU CLIENT
${missing.map((m, i) => `${i + 1}. ${m}`).join('\n')}

# INSTRUCTIONS DE RÉDACTION
${channelInstructions}

Règles communes :
- Clair sur ce qui manque, précis sur les dates et périodes
- Indique une deadline réaliste (7 jours ouvrés si pas d'autre info)
- Explique brièvement POURQUOI tu en as besoin (ex: "pour la déclaration TVA du 31 avril")
- Termine par un CTA simple ("Merci de m'envoyer ça par retour de mail")
- Pas de "Cher Monsieur/Madame", pas de formule de politesse à l'ancienne
- Pas d'invention : n'invente pas de deadline légale si tu n'es pas sûr

# FORMAT DE SORTIE OBLIGATOIRE
Retourne STRICTEMENT un objet JSON valide, sans markdown, sans commentaire avant ou après, sous la forme :

${channel === 'email' ? `{
  "subject": "...",
  "body": "..."
}` : `{
  "body": "..."
}`}

Réponds directement par le JSON, rien d'autre.`;
}

/**
 * Prompt Q&A sur dossier comptable
 */
export function buildQAPrompt(question: string, contextDocs: string[]): string {
  return `Tu es l'assistant IA d'un cabinet d'expertise comptable français.
Un collaborateur du cabinet te pose une question sur un dossier client.
Tu dois répondre en t'appuyant STRICTEMENT sur les documents fournis ci-dessous.

# QUESTION DU COLLABORATEUR
${question}

# DOCUMENTS DU DOSSIER (extraits pertinents)
${contextDocs.map((d, i) => `[Doc ${i + 1}]\n${d}`).join('\n\n')}

# RÈGLES STRICTES
- Si l'information n'est PAS dans les documents, réponds exactement : "Je n'ai pas cette information dans les documents du dossier."
- Cite les documents que tu utilises (ex: "D'après [Doc 2]...")
- Pas d'invention, pas d'extrapolation, pas d'hypothèse
- Si la question demande un calcul, vérifie 2 fois et montre ton calcul
- Réponse concise : 2 à 5 phrases max, sauf si la question exige une liste détaillée
- Ton professionnel, factuel, français de France
- Format : texte brut, pas de markdown

# RÉPONSE
`;
}
