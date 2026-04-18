// POST /api/dossier/qa
// Body: { dossierId: string, question: string }
// Répond à une question sur un dossier en fouillant les documents

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { answerDossierQuestion } from '@/lib/claude/generate';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BodySchema = z.object({
  dossierId: z.string().regex(UUID_REGEX, 'Invalid UUID format'),
  question: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dossierId, question } = BodySchema.parse(body);

    const supabase = createAdminClient();

    // 1. Récupérer les documents pertinents du dossier
    // En MVP : on prend TOUS les documents, concat simple.
    // En v1 : vraie recherche sémantique via pgvector
    const { data: documents, error } = await supabase
      .from('documents')
      .select('filename, extracted_text, type, metadata')
      .eq('dossier_id', dossierId)
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Erreur récupération documents' }, { status: 500 });
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: "Aucun document n'est rattaché à ce dossier. Ajoutez des documents pour pouvoir poser des questions.",
        sources: [],
      });
    }

    // 2. Préparer le contexte pour Claude
    const contextDocs = documents.map((doc) => {
      const meta = doc.metadata ? ` [metadata: ${JSON.stringify(doc.metadata)}]` : '';
      return `Fichier: ${doc.filename || 'sans nom'} (type: ${doc.type})\nContenu: ${doc.extracted_text || '(texte non extrait)'}${meta}`;
    });

    // 3. Appeler Claude
    const result = await answerDossierQuestion(question, contextDocs);

    // 4. Logger la question en DB
    await supabase.from('qa_log').insert({
      dossier_id: dossierId,
      question,
      answer: result.answer,
      sources: documents.map((d) => d.filename).filter(Boolean),
      latency_ms: result.latency_ms,
    });

    return NextResponse.json({
      answer: result.answer,
      sources: documents.map((d) => d.filename).filter(Boolean),
      latency_ms: result.latency_ms,
    });
  } catch (error: any) {
    console.error('Q&A error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
