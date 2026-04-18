"use client";

import { useState, FormEvent } from "react";

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: Record<string, unknown> = {
      email: String(formData.get("email") || "").trim(),
      source: "landing",
    };

    const fullName = String(formData.get("nom") || "").trim();
    if (fullName) payload.full_name = fullName;

    const cabinet = String(formData.get("cabinet") || "").trim();
    if (cabinet) payload.cabinet_name = cabinet;

    const tailleRaw = String(formData.get("taille") || "").trim();
    if (tailleRaw) {
      const taille = parseInt(tailleRaw, 10);
      if (!Number.isNaN(taille) && taille >= 1 && taille <= 500) {
        payload.cabinet_size = taille;
      }
    }

    const stack = String(formData.get("stack") || "").trim();
    if (stack) payload.stack = stack;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription. Réessaye dans un instant.");
      } else {
        setSuccess(data.message || "Inscription réussie. On vous recontacte sous 24h ouvrées.");
        form.reset();
      }
    } catch {
      setError("Impossible de joindre le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="waitlist-success">
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <div>{success}</div>
      </div>
    );
  }

  return (
    <>
      <form className="waitlist-form" onSubmit={onSubmit} noValidate>
        <input type="text" name="nom" placeholder="Nom, Prénom" required />
        <input type="email" name="email" placeholder="Email professionnel" required />
        <input type="text" name="cabinet" placeholder="Nom de votre cabinet" />
        <input type="number" name="taille" placeholder="Nombre de collaborateurs" min={1} max={500} />
        <input type="text" name="stack" placeholder="Logiciel actuel (Pennylane / Tiime / autre)" />
        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Rejoindre la waitlist + réserver une démo"}
        </button>
      </form>
      {error ? <div className="waitlist-error">{error}</div> : null}
    </>
  );
}
