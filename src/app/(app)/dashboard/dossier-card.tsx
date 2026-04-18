"use client";

import Link from "next/link";
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
import { RelanceDialog } from "@/components/relance-dialog";
import { ArrowRight, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DossierStatus } from "@/lib/dossier/status";

type Props = {
  dossier: {
    id: string;
    client_name: string;
    regime_fiscal: string | null;
    secteur: string | null;
  };
  statusInfo: {
    status: DossierStatus;
    reasons: string[];
  };
};

const STATUS_CONFIG: Record<
  DossierStatus,
  {
    label: string;
    badgeClass: string;
    icon: typeof AlertCircle;
    showRelanceButton: boolean;
  }
> = {
  red: {
    label: "En retard",
    badgeClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: AlertCircle,
    showRelanceButton: true,
  },
  orange: {
    label: "Attention",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
    showRelanceButton: true,
  },
  green: {
    label: "À jour",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
    showRelanceButton: false,
  },
};

export function DossierCard({ dossier, statusInfo }: Props) {
  const cfg = STATUS_CONFIG[statusInfo.status];
  const Icon = cfg.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dossier.client_name}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          {dossier.regime_fiscal ? (
            <Badge variant="outline">{dossier.regime_fiscal}</Badge>
          ) : null}
          {dossier.secteur ? (
            <Badge variant="secondary">{dossier.secteur}</Badge>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1.5 ${cfg.badgeClass}`}
        >
          <Icon className="size-3.5" />
          {cfg.label}
        </Badge>

        {statusInfo.reasons.length > 0 ? (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {statusInfo.reasons.map((reason, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        {cfg.showRelanceButton ? (
          <RelanceDialog
            dossierId={dossier.id}
            triggerLabel="Générer relance"
            triggerSize="sm"
            triggerVariant="default"
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            Rien à relancer
          </span>
        )}
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dossier/${dossier.id}`}>
            Ouvrir
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
