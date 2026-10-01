import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import PulseLogo from '@/shared/components/PulseLogo'

type LegalSectionProps = {
  title: string
  children: ReactNode
}

function LegalSection({
  title,
  children,
}: LegalSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-black text-white sm:text-xl">
        {title}
      </h2>

      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300 sm:text-base">
        {children}
      </div>
    </section>
  )
}

function LegalNavigation() {
  return (
    <div className="flex flex-wrap gap-2">

      <Link
        to="/conditions-utilisation"
        className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#d94a0b] hover:text-white"
      >
        CGU
      </Link>

      <Link
        to="/politique-confidentialite"
        className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#d94a0b] hover:text-white"
      >
        Confidentialité
      </Link>

      <Link
        to="/mentions-legales"
        className="rounded-full bg-[#d94a0b] px-4 py-2 text-xs font-black text-white"
      >
        Mentions légales
      </Link>

    </div>
  )
}

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">

        <div className="mb-8 flex justify-center">
          <Link to="/">
            <PulseLogo className="h-14 w-auto" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-800 p-6 sm:p-10">

            <LegalNavigation />

            <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#d94a0b]">
              PULSE
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Mentions légales
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Version 1.0 — Mise à jour : 1er octobre 2026
            </p>

          </div>

          <div className="space-y-10 p-6 sm:p-10">

            <LegalSection title="1. Édition de PULSE">
              <p>
                PULSE est un service numérique édité
                à titre non professionnel par une personne physique.
              </p>

              <p>
                Conformément aux dispositions applicables
                aux services de communication au public en ligne,
                un éditeur non professionnel peut préserver
                son anonymat sous réserve d’avoir communiqué
                les éléments d’identification requis
                à son fournisseur d’hébergement.
              </p>

              <p>
                Contact :
              </p>

              <a
                href="mailto:humans.pulsee@gmail.com"
                className="font-black text-[#f97316] underline underline-offset-4"
              >
                humans.pulsee@gmail.com
              </a>
            </LegalSection>

            <LegalSection title="2. Plateforme">
              <p>
                Nom du service :
              </p>

              <p className="font-black text-white">
                PULSE
              </p>

              <p>
                Nom de domaine :
              </p>

              <p className="font-black text-white">
                humanspulse.fr
              </p>
            </LegalSection>

            <LegalSection title="3. Hébergement">
              <p>
                La plateforme PULSE est hébergée par :
              </p>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
                <p className="font-black text-white">
                  Vercel Inc.
                </p>

                <p className="mt-2">
                  440 N Barranca Avenue #4133
                </p>

                <p>
                  Covina, CA 91723
                </p>

                <p>
                  États-Unis
                </p>

                <p className="mt-3">
                  Téléphone : +1 559 288 7060
                </p>

                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex font-bold text-[#f97316] underline underline-offset-4"
                >
                  vercel.com
                </a>
              </div>
            </LegalSection>

            <LegalSection title="4. Services techniques">
              <p>
                PULSE utilise différents prestataires
                nécessaires au fonctionnement de la plateforme,
                notamment pour l’hébergement,
                l’authentification, la base de données
                et l’envoi d’e-mails transactionnels.
              </p>

              <p>
                Les informations relatives au traitement
                de données personnelles par ces services
                sont détaillées dans la{' '}
                <Link
                  to="/politique-confidentialite"
                  className="font-bold text-[#f97316] underline underline-offset-4"
                >
                  Politique de confidentialité
                </Link>.
              </p>
            </LegalSection>

            <LegalSection title="5. Propriété intellectuelle">
              <p>
                Sauf indication contraire, les éléments
                constituant PULSE, notamment son nom,
                son identité visuelle, ses interfaces,
                ses éléments graphiques, ses textes
                et ses créations originales peuvent être protégés
                par les règles applicables en matière
                de propriété intellectuelle.
              </p>

              <p>
                Toute reproduction ou exploitation non autorisée
                peut être interdite lorsque ces éléments
                sont protégés par des droits.
              </p>
            </LegalSection>

            <LegalSection title="6. Données personnelles">
              <p>
                PULSE peut traiter des données personnelles
                nécessaires au fonctionnement de la plateforme.
              </p>

              <p>
                Les informations concernant les finalités,
                bases juridiques, destinataires,
                durées de conservation et droits des utilisateurs
                sont disponibles dans la{' '}
                <Link
                  to="/politique-confidentialite"
                  className="font-bold text-[#f97316] underline underline-offset-4"
                >
                  Politique de confidentialité
                </Link>.
              </p>
            </LegalSection>

            <LegalSection title="7. Responsabilité">
              <p>
                PULSE est un outil destiné à faciliter
                la coordination d’actions solidaires.
              </p>

              <p>
                La plateforme ne constitue pas un service
                médical, un service social officiel,
                un service d’urgence ou un service de secours.
              </p>

              <p>
                Les utilisateurs restent responsables
                des informations qu’ils publient
                et des actions qu’ils réalisent
                à partir des informations disponibles
                sur la plateforme.
              </p>
            </LegalSection>

            <LegalSection title="8. Signalement d’un contenu ou d’un problème">
              <p>
                Pour signaler un contenu,
                un problème de sécurité,
                une erreur ou une difficulté concernant PULSE :
              </p>

              <a
                href="mailto:humans.pulsee@gmail.com"
                className="font-black text-[#f97316] underline underline-offset-4"
              >
                humans.pulsee@gmail.com
              </a>
            </LegalSection>

            <LegalSection title="9. Contact">
              <p>
                Pour toute question relative
                à la plateforme PULSE :
              </p>

              <a
                href="mailto:humans.pulsee@gmail.com"
                className="font-black text-[#f97316] underline underline-offset-4"
              >
                humans.pulsee@gmail.com
              </a>
            </LegalSection>

          </div>

          <div className="border-t border-slate-800 p-6 sm:p-10">
            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                to="/register"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
              >
                Retour à l’inscription
              </Link>

              <Link
                to="/conditions-utilisation"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Lire les CGU
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}