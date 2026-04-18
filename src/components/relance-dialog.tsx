"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Copy, Loader2, Mail, MessageCircle } from "lucide-react";

interface Relance {
  id: string;
  email_subject: string | null;
  status: string;
  created_at: string;
  content_email: string | null;
  content_whatsapp: string | null;
}

interface RelanceResult {
  subject?: string;
  body: string;
  id: string | null;
  missing: string[];
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Brouillon", variant: "outline" },
  validated: { label: "Validée", variant: "secondary" },
  sent: { label: "Envoyée", variant: "default" },
  archived: { label: "Archivée", variant: "outline" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RelanceDialog({
  dossierId,
  onGenerated,
  triggerLabel = "Générer une relance",
  triggerVariant = "default",
  triggerSize = "sm",
}: {
  dossierId: string;
  onGenerated?: (r: Relance) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerSize?: "sm" | "default" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RelanceResult | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/relance/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, channel }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const data: RelanceResult = await res.json();
      setResult(data);

      onGenerated?.({
        id: data.id ?? crypto.randomUUID(),
        email_subject: data.subject ?? null,
        status: "draft",
        created_at: new Date().toISOString(),
        content_email: channel === "email" ? data.body : null,
        content_whatsapp: channel === "whatsapp" ? data.body : null,
      });

      toast.success("Relance générée avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size={triggerSize} variant={triggerVariant}>
          <Plus className="size-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle relance</DialogTitle>
        </DialogHeader>

        <Tabs
          value={channel}
          onValueChange={(v) => {
            setChannel(v as "email" | "whatsapp");
            setResult(null);
          }}
        >
          <TabsList>
            <TabsTrigger value="email">
              <Mail className="size-3.5" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <MessageCircle className="size-3.5" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-3 mt-3">
            {result ? (
              <div className="space-y-3">
                {result.subject && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Objet
                    </p>
                    <p className="text-sm font-medium">{result.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Corps
                  </p>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                    {result.body}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Cliquez sur &quot;Générer&quot; pour créer un email de relance.
              </p>
            )}
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-3 mt-3">
            {result ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Message
                </p>
                <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {result.body}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Cliquez sur &quot;Générer&quot; pour créer un message WhatsApp.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {result ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopy(
                  result.subject
                    ? `Objet: ${result.subject}\n\n${result.body}`
                    : result.body
                )
              }
            >
              <Copy className="size-3.5" />
              Copier
            </Button>
          ) : (
            <Button size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                "Générer"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RelanceSection({
  dossierId,
  initialRelances,
}: {
  dossierId: string;
  initialRelances: Relance[];
}) {
  const [relances, setRelances] = useState(initialRelances);

  function handleNewRelance(r: Relance) {
    setRelances((prev) => [r, ...prev]);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium">Relances</h2>
        <RelanceDialog dossierId={dossierId} onGenerated={handleNewRelance} />
      </div>

      {relances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucune relance générée.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {relances.map((relance) => {
            const cfg = statusConfig[relance.status] ?? statusConfig.draft;
            return (
              <Card key={relance.id} size="sm">
                <CardContent className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {relance.email_subject || "Relance WhatsApp"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(relance.created_at)}
                    </p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
