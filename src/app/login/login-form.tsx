"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authError = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!email) {
      setError("Renseigne ton email.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message || "Erreur lors de l'envoi du lien. Réessaye.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-5 text-center text-[#10B981]">
        <div className="mb-2 text-3xl">✓</div>
        <div className="font-semibold">Email envoyé</div>
        <p className="mt-2 text-sm text-[#8FA3C5]">
          Clique sur le lien dans l&apos;email pour te connecter. Pense à
          vérifier tes spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      {authError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {authError === "auth_failed"
            ? "Le lien a expiré ou a déjà été utilisé. Demande-en un nouveau."
            : "Erreur de connexion. Réessaye."}
        </div>
      ) : null}

      <input
        type="email"
        name="email"
        placeholder="vous@cabinet.fr"
        autoComplete="email"
        required
        className="rounded-xl border border-[#1E3558] bg-[#0F1E38] px-4 py-3 text-[#F2F5FA] placeholder:text-[#8FA3C5] focus:border-[#3B82F6] focus:outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] px-4 py-3 font-semibold text-white transition-transform hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? "Envoi du lien..." : "Recevoir un lien de connexion"}
      </button>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </form>
  );
}
