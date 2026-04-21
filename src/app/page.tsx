import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing-root">
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">C</div>
            CabiPilot
          </Link>
          <nav className="nav-links">
            <a href="#probleme">Le problème</a>
            <a href="#solution">Fonctionnalités</a>
            <a href="#methode">Méthode</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a
            href="#waitlist"
            className="btn btn-primary"
            style={{ padding: "10px 20px", fontSize: 14 }}
          >
            Rejoindre la waitlist
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-inner">
          <span className="pill">
            <span className="pill-dot"></span> 3 places de design partners disponibles — 50% à vie
          </span>
          <h1 className="headline">
            Vos collaborateurs récupèrent{" "}
            <span className="highlight">10 heures par semaine.</span>
          </h1>
          <p className="lead">
            CabiPilot est le copilote IA dédié aux cabinets d&apos;expertise comptable qui
            utilisent <strong>Pennylane</strong>. Il rédige vos relances clients,
            résume vos dossiers et répond aux questions répétitives —{" "}
            <strong>sans migration, vos données restent dans Pennylane</strong>.
          </p>
          <div className="cta-row">
            <a href="#waitlist" className="btn btn-primary">
              Demander une démo (15 min)
            </a>
            <a href="#solution" className="btn btn-ghost">
              Voir comment ça marche
            </a>
          </div>
          <div className="trust-row">
            <div className="trust-item">
              <span className="trust-check">✓</span> Zéro migration de données
            </div>
            <div className="trust-item">
              <span className="trust-check">✓</span> Hébergement France — RGPD
            </div>
            <div className="trust-item">
              <span className="trust-check">✓</span> Intégration API Pennylane officielle
            </div>
            <div className="trust-item">
              <span className="trust-check">✓</span> 20 min d&apos;onboarding par collab
            </div>
          </div>
        </div>
      </section>

      <div className="proof-bar">
        <div className="container proof-inner">
          <div className="proof-label">Le problème des cabinets comptables en France</div>
          <div className="proof-stats">
            <div className="proof-stat">
              <h3>8 mois</h3>
              <p>durée moyenne pour pourvoir un poste de collaborateur en 2025</p>
            </div>
            <div className="proof-stat">
              <h3>52%</h3>
              <p>du temps d&apos;un collab passé sur des tâches à faible valeur ajoutée</p>
            </div>
            <div className="proof-stat">
              <h3>+23%</h3>
              <p>charge de travail par collab depuis 2022 dans les cabinets français</p>
            </div>
          </div>
        </div>
      </div>

      <section className="block" id="probleme">
        <div className="container">
          <div className="eyebrow">Le constat</div>
          <h2>Vos collabs sont submergés par des tâches qu&apos;une IA ferait en secondes.</h2>
          <p className="intro">
            Recruter est devenu impossible. Croître sans embaucher paraît hors de portée. Pourtant,
            10 à 15 heures par semaine par collaborateur sont consommées par des tâches
            ultra-répétitives qui pourraient disparaître.
          </p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">📧</div>
              <h3>Relances clients sans fin</h3>
              <p>
                Factures manquantes, justificatifs URSSAF, pièces TVA. Chaque collab passe 2-3h/jour
                à relancer. À la main. Avec un taux de réponse médiocre.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">❓</div>
              <h3>Questions clients répétitives</h3>
              <p>
                &laquo;&nbsp;C&apos;est quoi mon régime fiscal&nbsp;?&nbsp;&raquo;, &laquo;&nbsp;Pourquoi j&apos;ai X € de TVA&nbsp;?&nbsp;&raquo;. Vos collabs
                répondent 20 fois par jour aux mêmes questions, au lieu de conseiller.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📂</div>
              <h3>Recherche dans les dossiers</h3>
              <p>
                Fouiller un FEC, retrouver une facture de 2023, extraire un montant — 30 min par
                demande. 10 demandes/jour. Vous faites le calcul.
              </p>
            </div>
          </div>
          <div className="problem-quote">
            «&nbsp;On a 3 postes de collabs ouverts depuis 8 mois. Personne ne répond. Mes collabs
            partent ou sont en burnout. Je veux faire +20&nbsp;% de CA l&apos;an prochain — sans
            l&apos;IA, c&apos;est juste impossible.&nbsp;»
            <strong>
              — Denis L., expert-comptable associé, cabinet 12 collabs (témoignage discovery call,
              janvier 2026)
            </strong>
          </div>
        </div>
      </section>

      <section className="block features" id="solution">
        <div className="container">
          <div className="eyebrow">Les fonctionnalités</div>
          <h2>Trois briques. Un objectif. Libérer vos collabs.</h2>
          <p className="intro">
            CabiPilot ne remplace pas votre logiciel. Il se connecte à{" "}
            <strong>Pennylane en lecture seule</strong> — vos données ne bougent pas,
            jamais. On lit à la volée, on ne stocke rien.
          </p>

          <div className="feature">
            <div className="feature-text">
              <span className="feat-tag">Fonction 1 · Relances IA</span>
              <h3>Une relance client rédigée en 5 secondes.</h3>
              <p>
                Votre collab clique sur un dossier incomplet. L&apos;IA lit le contexte, identifie
                les pièces manquantes, et rédige une relance personnalisée — WhatsApp et email —
                avec le ton de votre cabinet.
              </p>
              <ul>
                <li>Personnalisation fine (nom du dirigeant, ton cabinet, deadline)</li>
                <li>Multi-canal : WhatsApp + email + SMS</li>
                <li>Détection automatique des pièces manquantes par mois</li>
                <li>Le collab valide en 5 sec avant envoi</li>
              </ul>
            </div>
            <div className="mock">
              <div className="mock-head">
                <span className="mock-dot r"></span>
                <span className="mock-dot y"></span>
                <span className="mock-dot g"></span>
                <span className="mock-title">cabipilot.fr / relance Boucherie Marcel</span>
              </div>
              <div className="mock-msg">
                <div className="mock-msg-label">💬 WhatsApp généré en 4 sec</div>
                Bonjour Monsieur Dupont,
                <br />
                <br />
                Il me manque vos factures d&apos;achat de mars pour boucler votre TVA trimestrielle :
                <br />
                • Factures viande (habituellement ~12 pièces)
                <br />
                • Relevé bancaire mars 2026
                <br />
                <br />
                Pouvez-vous me les envoyer avant vendredi 24 ? Deadline TVA : 31 avril.
                <br />
                <br />
                Merci 🙏
                <br />
                Julie — Cabinet Martin &amp; Associés
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <span className="mock-tag">Généré par IA</span>
                <span
                  className="mock-tag"
                  style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}
                >
                  Validé
                </span>
              </div>
            </div>
          </div>

          <div className="feature" style={{ direction: "rtl" }}>
            <div className="feature-text" style={{ direction: "ltr" }}>
              <span className="feat-tag">Fonction 2 · Q&amp;A sur dossier</span>
              <h3>Posez une question — l&apos;IA fouille et répond.</h3>
              <p>
                &laquo;&nbsp;Combien de TVA déductible sur Q1&nbsp;?&nbsp;&raquo;
                &laquo;&nbsp;Quelles sont les factures de plus de 10k € en 2025&nbsp;?&nbsp;&raquo; L&apos;IA analyse les
                FEC, factures et docs du dossier et répond en citant ses sources.
              </p>
              <ul>
                <li>Recherche sémantique sur tout le dossier (factures, FEC, contrats)</li>
                <li>Citations exactes des documents sources</li>
                <li>Zéro invention : répond &laquo;&nbsp;je ne sais pas&nbsp;&raquo; si l&apos;info n&apos;est pas là</li>
                <li>Historique consultable de toutes les questions</li>
              </ul>
            </div>
            <div className="mock" style={{ direction: "ltr" }}>
              <div className="mock-head">
                <span className="mock-dot r"></span>
                <span className="mock-dot y"></span>
                <span className="mock-dot g"></span>
                <span className="mock-title">cabipilot.fr / Q&amp;A dossier</span>
              </div>
              <div
                className="mock-msg"
                style={{ borderLeftColor: "var(--accent-bright)", background: "var(--bg-2)" }}
              >
                <div className="mock-msg-label">❓ Question du collab</div>
                Combien de TVA collectée sur Q1 2026 pour Boucherie Marcel ?
              </div>
              <div className="mock-msg" style={{ borderLeftColor: "var(--success)" }}>
                <div className="mock-msg-label">🤖 Réponse CabiPilot — 3 sec</div>
                D&apos;après le FEC Q1 2026 (document #142), la TVA collectée totale est de{" "}
                <strong>4 287,53 €</strong>, répartie en :
                <br />
                • Janvier : 1 412,20 €
                <br />
                • Février : 1 338,91 €
                <br />
                • Mars : 1 536,42 €
                <br />
                <br />
                Sources : [FEC_2026_Q1.csv], [Facturier_mars.pdf]
              </div>
            </div>
          </div>

          <div className="feature">
            <div className="feature-text">
              <span className="feat-tag">Fonction 3 · Dashboard collab</span>
              <h3>Tous vos dossiers à traiter, priorisés par l&apos;IA.</h3>
              <p>
                Fini les post-it et les Excel chaotiques. Dashboard unique : ce qui est en retard,
                ce qui demande votre attention, ce que vous pouvez déléguer à l&apos;IA. Mesurez en
                temps réel le temps récupéré.
              </p>
              <ul>
                <li>Tri intelligent : dossiers prioritaires remontent en haut</li>
                <li>KPI en direct : heures économisées, relances envoyées, taux recouvrement</li>
                <li>Vue équipe : qui traite quoi</li>
                <li>Export mensuel pour le dirigeant du cabinet</li>
              </ul>
            </div>
            <div className="mock">
              <div className="mock-head">
                <span className="mock-dot r"></span>
                <span className="mock-dot y"></span>
                <span className="mock-dot g"></span>
                <span className="mock-title">cabipilot.fr / dashboard équipe</span>
              </div>
              <div className="mock-row">
                <span className="mock-label">Relances envoyées cette semaine</span>
                <span className="mock-value up">+87</span>
              </div>
              <div className="mock-row">
                <span className="mock-label">Heures économisées (équipe)</span>
                <span className="mock-value up">14,5 h</span>
              </div>
              <div className="mock-row">
                <span className="mock-label">Questions résolues par IA</span>
                <span className="mock-value">132</span>
              </div>
              <div className="mock-row">
                <span className="mock-label">Taux de recouvrement J+7</span>
                <span className="mock-value up">68 %</span>
              </div>
              <div className="mock-row">
                <span className="mock-label">Dossiers prioritaires</span>
                <span className="mock-value">7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block how" id="methode">
        <div className="container">
          <div className="eyebrow">La méthode</div>
          <h2>Trois étapes. Zéro révolution dans votre stack.</h2>
          <p className="intro">
            Vous n&apos;achetez pas un nouveau logiciel de production. Vous ajoutez une couche IA
            au-dessus de ce que vous utilisez déjà.
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h4>Connexion en 10 minutes</h4>
              <p>
                Vous connectez CabiPilot à votre compte Pennylane via OAuth 2.0. On se connecte en{" "}
                <strong>lecture seule</strong>. Vos collabs continuent d&apos;utiliser Pennylane
                habituellement, rien ne change côté production.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h4>Apprentissage du cabinet</h4>
              <p>
                L&apos;IA étudie vos anciens échanges (anonymisés) pour adopter le ton de votre
                cabinet, vos formules habituelles, votre style.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h4>Déploiement collab par collab</h4>
              <p>
                20 min d&apos;onboarding par collaborateur. Mesurez le temps récupéré dès la
                première semaine. Vous arrêtez quand vous voulez.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="tarifs">
        <div className="container">
          <div className="eyebrow">Tarifs</div>
          <h2>Un tarif par taille de cabinet. Sans engagement.</h2>
          <p className="intro">
            Résiliable à tout moment avec 30 jours de préavis. Trial 14 jours gratuit. Pas de setup
            fee.
          </p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Starter</h3>
              <p className="price-desc">Petits cabinets, 3 à 5 collaborateurs</p>
              <div className="price">
                149 €<small> / mois HT</small>
              </div>
              <ul>
                <li>
                  Intégration <strong>Pennylane</strong> via OAuth officielle
                </li>
                <li>Relances IA illimitées</li>
                <li>Q&amp;A dossier : 50 questions / mois</li>
                <li>Dashboard équipe</li>
                <li>Support email 48h</li>
              </ul>
              <a
                href="#waitlist"
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Commencer
              </a>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Recommandé</div>
              <h3>Pro</h3>
              <p className="price-desc">Cabinets moyens, 6 à 15 collaborateurs</p>
              <div className="price">
                349 €<small> / mois HT</small>
              </div>
              <ul>
                <li>
                  Intégration <strong>Pennylane</strong> complète (multi-dossiers)
                </li>
                <li>
                  Relances + <strong>envoi WhatsApp Business</strong> automatisé
                </li>
                <li>Q&amp;A dossier illimitées</li>
                <li>Reporting mensuel personnalisé</li>
                <li>Support prioritaire 24h + formation équipe (2h)</li>
                <li>Accès beta des nouvelles fonctionnalités</li>
              </ul>
              <a
                href="#waitlist"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Demander une démo
              </a>
            </div>
            <div className="pricing-card">
              <h3>Business</h3>
              <p className="price-desc">Grands cabinets, 16 à 30+ collaborateurs</p>
              <div className="price">
                699 €<small> / mois HT</small>
              </div>
              <ul>
                <li>Intégration <strong>Pennylane</strong> multi-comptes / multi-bureaux</li>
                <li>SSO Google / Microsoft</li>
                <li>API pour vos workflows internes</li>
                <li>Multi-entités illimitées</li>
                <li>Customer success manager dédié</li>
                <li>SLA 99,9 % + hébergement dédié OVH</li>
              </ul>
              <a
                href="#waitlist"
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Nous contacter
              </a>
            </div>
          </div>
          <div style={{ marginTop: 60 }}>
            <div className="dp-callout">
              <div className="dp-icon">🎯</div>
              <h3>Programme Design Partners — 3 places disponibles</h3>
              <p>
                Nous cherchons 3 cabinets partenaires pour co-construire CabiPilot.{" "}
                <strong>-50 % à vie</strong> sur votre abonnement en échange de 15 min de feedback
                hebdo pendant 2 mois. Vous aidez à façonner l&apos;outil, vous payez moitié prix
                pour toujours.
              </p>
              <a href="#waitlist" className="btn btn-primary">
                Candidater comme Design Partner
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="block waitlist" id="waitlist">
        <div className="container">
          <div className="waitlist-card">
            <h2>Réservez votre place.</h2>
            <p className="sub">
              Waitlist ou démo privée — on revient vers vous sous 24h ouvrées.
            </p>
            <WaitlistForm />
            <p className="waitlist-note">
              🔒 Vos données restent en France. Pas de spam. Désabonnement en 1 clic.
            </p>
          </div>
        </div>
      </section>

      <section className="block" id="faq">
        <div className="container">
          <div className="eyebrow">Questions fréquentes</div>
          <h2>Tout ce que vous voulez savoir.</h2>
          <p className="intro">
            Pas de réponse à votre question ? Écrivez à nathan.cottais@gmail.com — réponse sous 24h.
          </p>
          <div className="faq-list">
            <details className="faq">
              <summary>Faut-il migrer nos dossiers vers CabiPilot ?</summary>
              <div className="faq-body">
                <strong>Non, jamais.</strong> CabiPilot se connecte à votre Pennylane via
                l&apos;API officielle en <strong>lecture seule</strong>. Nous lisons les dossiers à
                la volée pour répondre à une question ou rédiger une relance, puis nous ne stockons
                rien. Vos données restent exclusivement chez Pennylane. Zéro duplication,
                zéro migration.
              </div>
            </details>
            <details className="faq">
              <summary>Faut-il changer de logiciel de production ?</summary>
              <div className="faq-body">
                Non. CabiPilot se greffe sur votre Pennylane via API. Vos collabs continuent
                d&apos;utiliser Pennylane exactement comme avant. CabiPilot est une interface
                séparée qui apporte l&apos;IA par-dessus — à utiliser uniquement quand c&apos;est
                pertinent. Pennylane reste votre source de vérité unique.
              </div>
            </details>
            <details className="faq">
              <summary>Pourquoi uniquement Pennylane ? Et si je suis sur Tiime, Cegid, Sage, ACD ?</summary>
              <div className="faq-body">
                Nous avons fait le choix volontaire de nous concentrer sur{" "}
                <strong>Pennylane uniquement</strong> en phase 1, pour construire la meilleure
                intégration possible plutôt que 10 intégrations moyennes. Si vous êtes sur un autre
                logiciel, rejoignez la waitlist &laquo;&nbsp;Priority&nbsp;&raquo; — nous ouvrons de
                nouvelles plateformes dès que notre communauté Pennylane est stable. D&apos;ici là,
                un mode &laquo;&nbsp;upload FEC ponctuel&nbsp;&raquo; est disponible pour tester le
                produit sur quelques dossiers.
              </div>
            </details>
            <details className="faq">
              <summary>Mes données de dossiers sont-elles protégées ?</summary>
              <div className="faq-body">
                Oui. Hébergement France (OVH / Scaleway), chiffrement en transit et au repos, DPA
                signé, conformité RGPD. Nous lisons les données via API en lecture seule, nous ne
                les stockons pas et elles ne sont jamais utilisées pour entraîner un modèle public.
                Engagement écrit de non-utilisation des données fourni dans le contrat.
              </div>
            </details>
            <details className="faq">
              <summary>L&apos;IA peut-elle faire des erreurs comptables ?</summary>
              <div className="faq-body">
                Possible sur les tâches de calcul complexes — raison pour laquelle CabiPilot{" "}
                <strong>ne valide jamais une action seule</strong>. L&apos;IA propose, le collab
                valide. Les relances, les Q&amp;A et tout ce qui sort du cabinet passe toujours par
                une validation humaine. Zéro automatisation aveugle.
              </div>
            </details>
            <details className="faq">
              <summary>Combien de temps pour mettre en place ?</summary>
              <div className="faq-body">
                30 min de setup avec notre équipe pour la connexion API + 20 min d&apos;onboarding
                par collaborateur. En général, un cabinet est opérationnel en 48h. Le retour sur
                investissement est visible dès la première semaine d&apos;usage.
              </div>
            </details>
            <details className="faq">
              <summary>Pourquoi le programme Design Partners ?</summary>
              <div className="faq-body">
                Nous voulons construire CabiPilot avec des cabinets réels, pas en chambre. 3
                cabinets payent 50 % du prix à vie en échange de 15 min de feedback hebdo pendant 2
                mois. Ils influencent directement la roadmap. C&apos;est notre moyen de livrer un
                produit qui colle vraiment au terrain.
              </div>
            </details>
            <details className="faq">
              <summary>Puis-je arrêter quand je veux ?</summary>
              <div className="faq-body">
                Oui. Résiliable avec 30 jours de préavis. Pas d&apos;engagement annuel. Nous
                facturons mensuellement. Si CabiPilot ne vous apporte pas de valeur, vous arrêtez,
                point.
              </div>
            </details>
            <details className="faq">
              <summary>Qui est derrière CabiPilot ?</summary>
              <div className="faq-body">
                Nathan Cottais, entrepreneur solo basé en France, spécialisé en automatisation IA
                pour PME (Axiomate). CabiPilot naît du constat répété en mission : les cabinets
                comptables ont un besoin énorme d&apos;automatisation que personne ne sert
                correctement. Pas d&apos;investisseurs, pas de pression de croissance, juste la
                volonté de livrer un outil sérieux.
              </div>
            </details>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container foot-inner">
          <div className="logo">
            <div className="logo-mark">C</div> CabiPilot
          </div>
          <div className="foot-links">
            <a href="#solution">Fonctionnalités</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:nathan.cottais@gmail.com">Contact</a>
          </div>
          <div>© 2026 CabiPilot — Propulsé par Axiomate 🇫🇷</div>
        </div>
      </footer>
    </div>
  );
}
