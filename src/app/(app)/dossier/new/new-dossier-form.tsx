"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type FecSummary = {
  line_count: number;
  total_debit: number;
  total_credit: number;
  first_date: string | null;
  last_date: string | null;
  tva_collectee: number;
  tva_deductible: number;
  charges_total: number;
  produits_total: number;
};

type CreateResult = {
  ok: true;
  dossier_id: string;
  fec: {
    lines_count: number;
    summary: FecSummary;
    warnings: string[];
  } | null;
};

export function NewDossierForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fecFileName, setFecFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/dossier/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle2 className="size-6 text-emerald-500" />
          <h2 className="text-xl font-semibold">Dossier créé</h2>
        </div>

        {result.fec ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <Stat label="Lignes FEC" value={result.fec.lines_count.toLocaleString("fr-FR")} />
              <Stat
                label="Total débit"
                value={result.fec.summary.total_debit.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <Stat
                label="Total crédit"
                value={result.fec.summary.total_credit.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <Stat
                label="Période"
                value={
                  result.fec.summary.first_date && result.fec.summary.last_date
                    ? `${result.fec.summary.first_date} → ${result.fec.summary.last_date}`
                    : "—"
                }
              />
              <Stat
                label="TVA collectée"
                value={result.fec.summary.tva_collectee.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <Stat
                label="TVA déductible"
                value={result.fec.summary.tva_deductible.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <Stat
                label="Charges (cl. 6)"
                value={result.fec.summary.charges_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <Stat
                label="Produits (cl. 7)"
                value={result.fec.summary.produits_total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
            </div>

            {result.fec.warnings.length > 0 ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4" />
                  Avertissements
                </div>
                <ul className="ml-5 list-disc space-y-1">
                  {result.fec.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Dossier créé sans FEC. Tu pourras en ajouter un depuis la page du dossier.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button onClick={() => router.push(`/dossier/${result.dossier_id}`)}>
            Ouvrir le dossier
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Retour au dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold">Informations client</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nom du client / raison sociale" htmlFor="client_name" required>
            <Input id="client_name" name="client_name" required placeholder="SARL Dupont" />
          </Field>

          <Field label="SIRET" htmlFor="siret">
            <Input
              id="siret"
              name="siret"
              placeholder="812 345 678 00025"
              pattern="[0-9 ]{9,17}"
            />
          </Field>

          <Field label="Email client" htmlFor="client_email">
            <Input
              id="client_email"
              name="client_email"
              type="email"
              placeholder="contact@dupont.fr"
            />
          </Field>

          <Field label="Téléphone" htmlFor="client_phone">
            <Input id="client_phone" name="client_phone" type="tel" placeholder="06 12 34 56 78" />
          </Field>

          <Field label="Régime fiscal" htmlFor="regime_fiscal">
            <select
              id="regime_fiscal"
              name="regime_fiscal"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              defaultValue=""
            >
              <option value="">—</option>
              <option value="BIC_REEL_NORMAL">BIC — Réel Normal</option>
              <option value="BIC_REEL_SIMPLIFIE">BIC — Réel Simplifié</option>
              <option value="BIC_MICRO">BIC — Micro</option>
              <option value="BNC_DECLARATIF">BNC — Déclaration contrôlée</option>
              <option value="BNC_MICRO">BNC — Micro-BNC</option>
              <option value="BA_REEL">BA — Réel</option>
              <option value="IS">IS</option>
            </select>
          </Field>

          <Field label="Secteur d'activité" htmlFor="secteur">
            <Input id="secteur" name="secteur" placeholder="Boulangerie, Conseil IT, …" />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 text-base font-semibold">Fichier FEC (facultatif)</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Export du FEC depuis Pennylane ou ton logiciel actuel. Formats acceptés :
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">.csv</code>
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">.txt</code>. Les 18 colonnes
          normées sont détectées automatiquement, séparateur tab/pipe/point-virgule.
        </p>

        <div
          className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-input bg-muted/30 p-4 transition-colors hover:bg-muted/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center gap-3">
            {fecFileName ? (
              <>
                <FileText className="size-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{fecFileName}</div>
                  <div className="text-xs text-muted-foreground">Cliquer pour changer</div>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="size-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Glisser ou choisir un fichier FEC</div>
                  <div className="text-xs text-muted-foreground">CSV / TSV — 25 Mo max</div>
                </div>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="fec"
          accept=".csv,.txt,.tsv,text/csv,text/plain,text/tab-separated-values"
          className="hidden"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            setFecFileName(f?.name || null);
          }}
        />
      </Card>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer le dossier"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
