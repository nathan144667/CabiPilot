import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Mail, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const CABINET_ID = "11111111-1111-1111-1111-111111111111";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  validated: { label: "Validée", variant: "default" },
  sent: { label: "Envoyée", variant: "default" },
  archived: { label: "Archivée", variant: "outline" },
};

export default async function RelancesPage() {
  const supabase = createAdminClient();

  // Récupérer toutes les relances du cabinet (via jointure dossiers)
  const { data: relances } = await supabase
    .from("relances")
    .select(`
      id,
      reason,
      email_subject,
      content_email,
      content_whatsapp,
      status,
      created_at,
      sent_at,
      dossiers!inner(id, client_name, cabinet_id)
    `)
    .eq("dossiers.cabinet_id", CABINET_ID)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relances</h1>
          <p className="text-muted-foreground mt-1">
            Historique complet des relances générées par CabiPilot.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Send className="size-4" />
            Nouvelle relance
          </Link>
        </Button>
      </div>

      {!relances || relances.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Send className="size-10 mx-auto mb-4 opacity-50" />
            <p>Aucune relance pour le moment.</p>
            <p className="text-sm mt-1">
              Générez votre première relance depuis un dossier du{" "}
              <Link href="/dashboard" className="underline">
                dashboard
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {relances.map((r: any) => {
            const status = statusLabels[r.status] || { label: r.status, variant: "outline" };
            const channel = r.content_email ? "email" : "whatsapp";
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline" className="gap-1">
                          {channel === "email" ? <Mail className="size-3" /> : <MessageCircle className="size-3" />}
                          {channel === "email" ? "Email" : "WhatsApp"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {r.dossiers.client_name}
                      </CardTitle>
                      {r.email_subject && (
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                          {r.email_subject}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dossier/${r.dossiers.id}`}>
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {r.reason && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Motif : {r.reason}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap line-clamp-3 text-muted-foreground">
                    {r.content_email || r.content_whatsapp}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
