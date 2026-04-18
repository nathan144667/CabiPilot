// POST /api/waitlist
// Body: { email, full_name?, cabinet_name?, cabinet_size?, stack?, source? }
// Inscrit un prospect à la waitlist

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

const BodySchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional(),
  cabinet_name: z.string().optional(),
  cabinet_size: z.number().int().min(1).max(500).optional(),
  stack: z.string().optional(),
  source: z.string().optional().default('landing'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = BodySchema.parse(body);

    const supabase = createAdminClient();

    const { data: inserted, error } = await supabase
      .from('waitlist')
      .insert(data)
      .select()
      .single();

    if (error) {
      // Duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { ok: true, message: 'Vous êtes déjà sur la waitlist. Merci !' },
          { status: 200 }
        );
      }
      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      message: 'Inscription réussie. On vous recontacte sous 24h ouvrées.',
    });
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}
