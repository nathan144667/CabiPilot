import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Connexion — CabiPilot",
  description: "Connectez-vous à votre espace cabinet CabiPilot.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1628] px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-[#F2F5FA]"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] font-extrabold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            C
          </div>
          <span className="text-lg font-bold tracking-tight">CabiPilot</span>
        </Link>

        <div className="rounded-2xl border border-[#1E3558] bg-[#162845] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <h1 className="mb-2 text-2xl font-bold text-[#F2F5FA]">
            Connexion à votre cabinet
          </h1>
          <p className="mb-6 text-sm text-[#8FA3C5]">
            Entrez votre email professionnel. Vous recevrez un lien magique
            pour vous connecter sans mot de passe.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-[#8FA3C5]">
            🔒 Aucun mot de passe à retenir. Votre email sert aussi de 2FA.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#8FA3C5]">
          Pas encore de compte ?{" "}
          <Link
            href="/#waitlist"
            className="font-medium text-[#60A5FA] hover:underline"
          >
            Rejoindre la waitlist
          </Link>
        </p>
      </div>
    </div>
  );
}
