import { NewDossierForm } from "./new-dossier-form";

export const metadata = {
  title: "Nouveau dossier — CabiPilot",
};

export default function NewDossierPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nouveau dossier</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crée un dossier client en mode upload manuel. Utile pour tester
          CabiPilot avant l&apos;intégration Pennylane OAuth, ou pour un
          dossier ponctuel non synchronisé.
        </p>
      </div>

      <NewDossierForm />
    </div>
  );
}
