import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Plug, Building2, Users, Shield } from "lucide-react";

export default function ParametresPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="size-7" />
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Configuration de votre cabinet et de vos intégrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Cabinet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Cabinet
            </CardTitle>
            <CardDescription>Informations de votre cabinet d'expertise comptable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom</span>
              <span className="font-medium">Cabinet Martin &amp; Associés (DÉMO)</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">SIRET</span>
              <span className="font-mono">12345678901234</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <Badge>Design Partner</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Intégrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="size-5" />
              Intégrations
            </CardTitle>
            <CardDescription>Connectez CabiPilot à votre logiciel de production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Pennylane</div>
                <div className="text-xs text-muted-foreground">Connecté en lecture seule</div>
              </div>
              <Badge variant="default">Connecté</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
              <div>
                <div className="font-medium">Tiime, Cegid, Sage, ACD</div>
                <div className="text-xs text-muted-foreground">
                  Focus Pennylane en phase 1. Autres plateformes sur demande waitlist.
                </div>
              </div>
              <Badge variant="outline">Roadmap</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Équipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Équipe
            </CardTitle>
            <CardDescription>Gérez les collaborateurs qui accèdent à CabiPilot.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gestion multi-utilisateurs disponible en v1 (mois prochain).
            </p>
          </CardContent>
        </Card>

        {/* Sécurité & RGPD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Sécurité &amp; RGPD
            </CardTitle>
            <CardDescription>Vos données restent en France.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hébergement</span>
              <span>🇫🇷 OVH Paris (eu-west-3)</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chiffrement</span>
              <span>AES-256 en transit + au repos</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">DPA</span>
              <Badge variant="outline">Disponible sur demande</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
