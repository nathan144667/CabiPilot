"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const authError = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";

  // Show the auth error once then clear it from UI state
  useEffect(() => {
    if (authError) setError(friendlyAuthError(authError));
  }, [authError]);

  async function onSubmitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const formData = new FormData(e.currentTarget);
    const inputEmail = String(formData.get("email") || "").trim().toLowerCase();

    if (!inputEmail) {
      setError("Renseigne ton email.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: inputEmail,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message || "Erreur lors de l'envoi du code. Réessaye.");
      return;
    }

    setEmail(inputEmail);
    setStep("code");
    setInfo(
      "Email envoyé. Entre le code à 6 chiffres reçu, ou clique sur le lien magique si tu n'es pas sur Gmail."
    );
  }

  async function onSubmitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const token = String(formData.get("token") || "").trim().replace(/\s/g, "");

    if (!/^\d{6}$/.test(token)) {
      setError("Le code doit contenir 6 chiffres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      setError(
        verifyError.message.toLowerCase().includes("expired")
          ? "Le code a expiré. Demande un nouveau code."
          : "Code invalide. Vérifie et réessaye."
      );
      return;
    }

    // Auth success → redirect
    router.push(next);
    router.refresh();
  }

  async function onResend() {
    if (!email) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message || "Erreur lors du renvoi.");
    } else {
      setInfo("Nouveau code envoyé.");
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={onSubmitCode} className="flex flex-col gap-3" noValidate>
        {info ? (
          <div className="rounded-lg border border-[#60A5FA]/30 bg-[#60A5FA]/10 px-3 py-2 text-sm text-[#60A5FA]">
            {info}
          </div>
        ) : null}

        <div className="text-sm text-[#8FA3C5]">
          Code envoyé à <span className="font-medium text-[#F2F5FA]">{email}</span>
        </div>

        <input
          type="text"
          name="token"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          autoComplete="one-time-code"
          autoFocus
          required
          className="rounded-xl border border-[#1E3558] bg-[#0F1E38] px-4 py-3 text-center font-mono text-xl tracking-widest text-[#F2F5FA] placeholder:text-[#8FA3C5] focus:border-[#3B82F6] focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] px-4 py-3 font-semibold text-white transition-transform hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? "Vérification…" : "Me connecter"}
        </button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
              setInfo(null);
            }}
            className="text-[#8FA3C5] underline hover:text-[#F2F5FA]"
          >
            Changer d&apos;email
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="text-[#60A5FA] hover:underline disabled:opacity-50"
          >
            Renvoyer un code
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        ) : null}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitEmail} className="flex flex-col gap-3" noValidate>
      {error && step === "email" ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
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
        {loading ? "Envoi du code..." : "Recevoir un code de connexion"}
      </button>
    </form>
  );
}

function friendlyAuthError(code: string): string {
  if (code === "auth_failed") {
    return "Le lien a expiré ou a déjà été utilisé (souvent à cause du scan anti-malware de Gmail). Utilise plutôt le code à 6 chiffres.";
  }
  return "Erreur de connexion. Réessaye.";
}
