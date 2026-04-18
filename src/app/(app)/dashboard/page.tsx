import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Force dynamic rendering — la page dépend de Supabase (env vars au runtime)
export const dynamic = "force-dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  FileEdit,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import { DossierCard } from "./dossier-card";
import { computeDossierStatuses, sortByUrgency } from "@/lib/dossier/status";

const DEMO_CABINET_ID = "11111111-1111-1111-1111-111111111111";

async function getCabinetId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEMO_CABINET_ID;
  const { data: profile } = await supabase
    .from("users_profile")
    .select("cabinet_id")
    .eq("id", user.id)
    .single();
  return (profile?.cabinet_id as string | undefined) || DEMO_CABINET_ID;
}

async function getKPIs(CABINET_ID: string) {
  const supabase = createAdminClient();

  // Fetch dossier IDs once
  const { data: dossierRows } = await supabase
    .from("dossiers")
    .select("id")
    .eq("cabinet_id", CABINET_ID);

  const dossierIds = dossierRows?.map((d) => d.id) ?? [];
  const totalDossiers = dossierIds.length;

  if (totalDossiers === 0) {
    return { totalDossiers: 0, draftRelances: 0, heures: 0, tauxRecouvrement: null };
  }

  const [relancesDraftRes, relancesTotalRes, relancesActiveRes, qaRes] =
    await Promise.all([
      supabase
        .from("relances")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft")
        .in("dossier_id", dossierIds),
      supabase
        .from("relances")
        .select("id", { count: "exact", head: true })
        .in("dossier_id", dossierIds),
      supabase
        .from("relances")
        .select("id", { count: "exact", head: true })
        .in("status", ["sent", "validated"])
        .in("dossier_id", dossierIds),
      supabase
        .from("qa_log")
        .select("id", { count: "exact", head: true })
        .in("dossier_id", dossierIds),
    ]);

  const draftRelances = relancesDraftRes.count ?? 0;
  const totalRelances = relancesTotalRes.count ?? 0;
  const activeRelances = relancesActiveRes.count ?? 0;
  const totalQA = qaRes.count ?? 0;

  const heures = totalRelances * 0.25 + totalQA * 0.1;
  const tauxRecouvrement =
    totalRelances > 0
      ? Math.round((activeRelances / totalRelances) * 100)
      : null;

  return { totalDossiers, draftRelances, heures, tauxRecouvrement };
}

async function getDossiers(CABINET_ID: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dossiers")
    .select("id, client_name, regime_fiscal, secteur, created_at")
    .eq("cabinet_id", CABINET_ID)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function DashboardPage() {
  const cabinetId = await getCabinetId();
  const [kpis, dossiersRaw] = await Promise.all([
    getKPIs(cabinetId),
    getDossiers(cabinetId),
  ]);

  // Enrichissement métier : statut + raisons + tri par urgence
  const dossiersWithStatus = await computeDossierStatuses(dossiersRaw);
  const dossiers = sortByUrgency(dossiersWithStatus);

  const counts = dossiers.reduce(
    (acc, d) => {
      acc[d.statusInfo.status]++;
      return acc;
    },
    { red: 0, orange: 0, green: 0 }
  );

  const kpiCards = [
    {
      label: "Dossiers",
      value: kpis.totalDossiers,
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      label: "En retard",
      value: counts.red,
      icon: FileEdit,
      color: "text-red-500",
    },
    {
      label: "Heures économisées",
      value: `${kpis.heures.toFixed(1)}h`,
      icon: Clock,
      color: "text-emerald-500",
    },
    {
      label: "Taux recouvrement",
      value: kpis.tauxRecouvrement !== null ? `${kpis.tauxRecouvrement}%` : "—",
      icon: TrendingUp,
      color: "text-violet-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d&apos;ensemble de votre cabinet
          </p>
        </div>
        <Button asChild>
          <Link href="/dossier/new">
            <Plus className="size-4" />
            Nouveau dossier
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} size="sm">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="flex items-center justify-between text-2xl">
                {kpi.value}
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Dossiers grid */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-medium">
            Dossiers clients
          </h2>
          {dossiers.length > 0 ? (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-red-500" />
                {counts.red} en retard
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-amber-500" />
                {counts.orange} attention
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-emerald-500" />
                {counts.green} à jour
              </span>
            </div>
          ) : null}
        </div>
        {dossiers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="mb-4">Aucun dossier pour le moment.</p>
              <Button asChild>
                <Link href="/dossier/new">
                  <Plus className="size-4" />
                  Créer votre premier dossier
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dossiers.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={{
                  id: dossier.id,
                  client_name: dossier.client_name,
                  regime_fiscal: dossier.regime_fiscal,
                  secteur: dossier.secteur,
                }}
                statusInfo={{
                  status: dossier.statusInfo.status,
                  reasons: dossier.statusInfo.reasons,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
