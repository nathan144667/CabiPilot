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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  FileEdit,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";

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
    .select("id, client_name, regime_fiscal, secteur, last_relance_at, created_at")
    .eq("cabinet_id", CABINET_ID)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

function isEnRetard(lastRelanceAt: string | null): boolean {
  if (!lastRelanceAt) return true;
  const diff = Date.now() - new Date(lastRelanceAt).getTime();
  return diff > 30 * 24 * 60 * 60 * 1000; // > 30 jours
}

export default async function DashboardPage() {
  const cabinetId = await getCabinetId();
  const [kpis, dossiers] = await Promise.all([
    getKPIs(cabinetId),
    getDossiers(cabinetId),
  ]);

  const kpiCards = [
    {
      label: "Dossiers",
      value: kpis.totalDossiers,
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      label: "Relances draft",
      value: kpis.draftRelances,
      icon: FileEdit,
      color: "text-amber-500",
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
        <h2 className="font-heading text-lg font-medium mb-4">Dossiers clients</h2>
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
            {dossiers.map((dossier) => {
              const enRetard = isEnRetard(dossier.last_relance_at);
              return (
                <Card key={dossier.id}>
                  <CardHeader>
                    <CardTitle>{dossier.client_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      {dossier.regime_fiscal && (
                        <Badge variant="outline">{dossier.regime_fiscal}</Badge>
                      )}
                      {dossier.secteur && (
                        <Badge variant="secondary">{dossier.secteur}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={enRetard ? "destructive" : "default"}
                      className={
                        enRetard
                          ? ""
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {enRetard ? "En retard" : "À jour"}
                    </Badge>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="ml-auto">
                      <Link href={`/dossier/${dossier.id}`}>
                        Ouvrir
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
