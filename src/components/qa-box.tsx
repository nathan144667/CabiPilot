"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  sources: string[] | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QABox({
  dossierId,
  initialLog,
}: {
  dossierId: string;
  initialLog: QAEntry[];
}) {
  const [log, setLog] = useState(initialLog);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setLoading(true);

    try {
      const res = await fetch("/api/dossier/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, question: q }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de la requête");
      }

      const data = await res.json();

      setLog((prev) => [
        {
          id: crypto.randomUUID(),
          question: q,
          answer: data.answer,
          sources: data.sources ?? [],
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setQuestion("");
      toast.success("Réponse reçue");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Combien de TVA Q1 ?"
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" size="default" disabled={loading || !question.trim()}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Demander
        </Button>
      </form>

      {/* History */}
      {log.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Posez une question sur ce dossier.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {log.map((entry) => (
            <Card key={entry.id} size="sm">
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>
                  <p className="text-sm font-medium mt-0.5">{entry.question}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {entry.answer}
                </div>
                {entry.sources && entry.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.sources.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
