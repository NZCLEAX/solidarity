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
        className="rounded-full bg-[#d94a0b] px-4 py-2 text-xs font-black text-white"
      >
        Confidentialité
      </Link>

      <Link
        to="/mentions-legales"
        className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#d94a0b] hover:text-white"
      >
        Mentions légales
      </Link>

    </div>
  )
}

export default function PrivacyPage() {
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
              Politique de confidentialité
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Version 1.0 — Mise à jour : 1er octobre 2026
            </p>

          </div>

          <div className="space-y-10 p-6 sm:p-10">

            <div className="rounded-2xl border border-orange-900/50 bg-orange-950/20 p-5">
              <p className="text-sm leading-7 text-orange-100">
                La présente Politique de confidentialité explique
                comment PULSE collecte, utilise et protège
                les données personnelles nécessaires
                au fonctionnement de la plateforme.
              </p>
            </div>

            <LegalSection title="1. Responsable du traitement">
              <p>
                Le responsable du traitement des données
                personnelles réalisé dans le cadre de PULSE est :
              </p>

              <p className="font-black text-white">
                [TON Mizab ET Sofiane]
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

            <LegalSection title="2. Données liées au compte">
              <p>
                Lors de la création et de l’utilisation d’un compte,
                PULSE peut traiter notamment :
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>nom ou nom affiché ;</li>
                <li>adresse e-mail ;</li>
                <li>rôle utilisateur ;</li>
                <li>statut du compte ;</li>
                <li>
                  informations nécessaires au rattachement
                  éventuel à une association ;
                </li>
                <li>
                  dates techniques liées à la création
                  et à la mise à jour du compte.
                </li>
              </ul>

              <p>
                Le mot de passe est géré par le système
                d’authentification et n’est pas affiché
                en clair dans PULSE.
              </p>
            </LegalSection>

            <LegalSection title="3. Données relatives aux associations">
              <p>
                Lorsqu’une association demande un accès,
                des informations supplémentaires peuvent être
                demandées afin d’étudier et vérifier sa demande.
              </p>

              <p>
                Cela peut comprendre notamment le nom
                de l’association, ses coordonnées,
                sa ville, sa zone d’action,
                son numéro SIREN ou SIRET,
                les informations relatives à son représentant
                et certains documents justificatifs.
              </p>
            </LegalSection>

            <LegalSection title="4. Signalements et points de terrain">
              <p>
                Lorsqu’un utilisateur crée ou modifie
                un point de terrain, PULSE peut traiter
                des informations liées à la situation signalée.
              </p>

              <p>
                Cela peut comprendre une adresse,
                des coordonnées géographiques,
                une estimation du nombre de personnes,
                les besoins observés, la typologie du point
                et les commentaires nécessaires
                à la coordination.
              </p>

              <p>
                Ces informations doivent être limitées
                au strict nécessaire.
              </p>
            </LegalSection>

            <LegalSection title="5. Données relatives aux interventions">
              <p>
                Lors de la création ou du suivi d’une intervention,
                PULSE peut traiter notamment :
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>le point concerné ;</li>
                <li>la date et les horaires ;</li>
                <li>le type d’aide apportée ;</li>
                <li>le nombre de repas lorsque cela est pertinent ;</li>
                <li>le nombre de bénévoles mobilisés ;</li>
                <li>le statut de l’intervention ;</li>
                <li>les commentaires nécessaires au suivi.</li>
              </ul>
            </LegalSection>

            <LegalSection title="6. Données sensibles">
              <p>
                PULSE n’a pas vocation à collecter des données
                sensibles concernant les personnes accompagnées.
              </p>

              <p>
                Les utilisateurs sont notamment invités à ne pas
                renseigner d’informations médicales,
                de documents d’identité, de convictions,
                d’origine ethnique, d’orientation sexuelle
                ou d’autres informations sensibles
                concernant les personnes rencontrées.
              </p>
            </LegalSection>

            <LegalSection title="7. Finalités des traitements">
              <p>
                Les données peuvent être traitées afin de :
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>créer et gérer les comptes utilisateurs ;</li>
                <li>sécuriser l’accès à PULSE ;</li>
                <li>confirmer les adresses e-mail ;</li>
                <li>permettre la récupération d’un compte ;</li>
                <li>gérer les rôles et autorisations ;</li>
                <li>
                  afficher et gérer les signalements
                  et points de terrain ;
                </li>
                <li>organiser les interventions ;</li>
                <li>
                  permettre la coordination entre utilisateurs,
                  bénévoles et associations ;
                </li>
                <li>vérifier certaines demandes associatives ;</li>
                <li>prévenir les abus et assurer la sécurité ;</li>
                <li>assurer le fonctionnement technique de PULSE.</li>
              </ul>
            </LegalSection>

            <LegalSection title="8. Bases juridiques">
              <p>
                Selon le traitement concerné, PULSE peut s’appuyer
                notamment sur :
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>
                  l’exécution du service demandé par l’utilisateur
                  et des conditions d’utilisation ;
                </li>

                <li>
                  l’intérêt légitime lié à la sécurité,
                  la prévention des abus et l’amélioration
                  du fonctionnement de la plateforme ;
                </li>

                <li>
                  le consentement lorsque celui-ci est requis ;
                </li>

                <li>
                  le respect d’une obligation légale
                  lorsqu’une telle obligation s’applique.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="9. Destinataires des données">
              <p>
                Les données sont accessibles uniquement
                aux personnes et services qui en ont besoin
                pour assurer le fonctionnement de PULSE.
              </p>

              <p>
                Selon la fonctionnalité concernée,
                certaines informations peuvent être visibles
                par des utilisateurs autorisés,
                des associations, des modérateurs
                ou des administrateurs.
              </p>

              <p>
                Des prestataires techniques peuvent également
                traiter certaines données pour le compte de PULSE.
              </p>
            </LegalSection>

            <LegalSection title="10. Prestataires techniques">
              <p>
                PULSE utilise notamment des services techniques
                nécessaires à son fonctionnement.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 py-3 font-black text-white">
                        Prestataire
                      </th>

                      <th className="px-3 py-3 font-black text-white">
                        Utilisation
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-3 py-3 font-bold">
                        Supabase
                      </td>
                      <td className="px-3 py-3">
                        Authentification, base de données
                        et services associés.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-3 font-bold">
                        Vercel
                      </td>
                      <td className="px-3 py-3">
                        Hébergement et déploiement
                        de l’application web.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-3 font-bold">
                        Resend
                      </td>
                      <td className="px-3 py-3">
                        Envoi d’e-mails transactionnels.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-3 font-bold">
                        Google
                      </td>
                      <td className="px-3 py-3">
                        Authentification lorsque l’utilisateur
                        choisit de se connecter avec Google.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </LegalSection>

            <LegalSection title="11. Transferts de données hors de l’Espace économique européen">
              <p>
                Certains prestataires techniques peuvent,
                selon leur infrastructure, leur configuration
                et leurs sous-traitants, traiter des données
                en dehors de l’Espace économique européen.
              </p>

              <p>
                Lorsque la réglementation l’exige,
                ces transferts doivent être encadrés
                par les mécanismes et garanties prévus
                par le RGPD.
              </p>
            </LegalSection>

            <LegalSection title="12. Durée de conservation">
              <p>
                Les données ne sont conservées que pendant
                une durée nécessaire aux finalités
                pour lesquelles elles sont traitées.
              </p>

              <p>
                Les données liées à un compte sont généralement
                conservées pendant la durée d’utilisation
                du compte, puis supprimées ou anonymisées
                lorsque leur conservation n’est plus nécessaire,
                sous réserve d’éventuelles obligations légales,
                de sauvegardes techniques ou de la nécessité
                de préserver l’historique de certaines actions.
              </p>

              <p>
                Les critères de conservation peuvent varier
                selon la nature de la donnée et le service
                technique utilisé.
              </p>
            </LegalSection>

            <LegalSection title="13. Sécurité">
              <p>
                Des mesures techniques et organisationnelles
                sont mises en œuvre afin de limiter
                les accès non autorisés, pertes,
                altérations ou divulgations de données.
              </p>

              <p>
                PULSE utilise notamment des mécanismes
                d’authentification, des règles d’accès
                et des restrictions liées aux rôles utilisateurs.
              </p>

              <p>
                Aucun système informatique ne peut toutefois
                garantir une sécurité absolue.
              </p>
            </LegalSection>

            <LegalSection title="14. Authentification avec Google">
              <p>
                Lorsqu’un utilisateur choisit l’authentification
                Google, certaines informations nécessaires
                à la création ou connexion du compte
                peuvent être transmises par Google
                au service d’authentification de PULSE.
              </p>

              <p>
                L’utilisation des services Google reste également
                soumise aux politiques applicables de Google.
              </p>
            </LegalSection>

            <LegalSection title="15. E-mails transactionnels">
              <p>
                PULSE peut utiliser l’adresse e-mail
                afin d’envoyer des messages nécessaires
                au fonctionnement du compte.
              </p>

              <p>
                Cela comprend notamment la confirmation
                de l’adresse e-mail, la réinitialisation
                du mot de passe et certaines informations
                importantes liées au compte.
              </p>

              <p>
                L’envoi de ces messages peut être assuré
                par le prestataire Resend.
              </p>
            </LegalSection>

            <LegalSection title="16. Droits des utilisateurs">
              <p>
                Selon les conditions prévues par la réglementation,
                chaque utilisateur peut notamment disposer
                des droits suivants :
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>droit d’accès ;</li>
                <li>droit de rectification ;</li>
                <li>droit à l’effacement ;</li>
                <li>droit à la limitation du traitement ;</li>
                <li>droit d’opposition lorsque applicable ;</li>
                <li>droit à la portabilité lorsque applicable ;</li>
                <li>
                  droit de retirer son consentement
                  lorsqu’un traitement repose sur le consentement.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="17. Exercer ses droits">
              <p>
                Pour toute demande relative à vos données
                personnelles :
              </p>

              <a
                href="mailto:humans.pulsee@gmail.com"
                className="font-black text-[#f97316] underline underline-offset-4"
              >
                humans.pulsee@gmail.com
              </a>

              <p>
                Afin de protéger les données,
                une vérification raisonnable de l’identité
                du demandeur peut être nécessaire.
              </p>
            </LegalSection>

            <LegalSection title="18. Réclamation auprès de la CNIL">
              <p>
                Si une personne estime que le traitement
                de ses données personnelles ne respecte pas
                la réglementation applicable, elle peut également
                introduire une réclamation auprès de la Commission
                nationale de l’informatique et des libertés,
                la CNIL.
              </p>
            </LegalSection>

            <LegalSection title="19. Données concernant des tiers">
              <p>
                Les utilisateurs ne doivent pas renseigner
                inutilement de données permettant d’identifier
                les personnes accompagnées ou rencontrées
                sur le terrain.
              </p>

              <p>
                Lorsqu’un utilisateur renseigne des informations
                concernant un tiers, il reste responsable
                de s’assurer que cette saisie est légitime,
                pertinente et limitée au nécessaire.
              </p>
            </LegalSection>

            <LegalSection title="20. Évolution de la politique">
              <p>
                La présente Politique de confidentialité
                peut être modifiée afin de tenir compte
                de l’évolution de PULSE,
                de ses prestataires ou de la réglementation.
              </p>

              <p>
                La date de dernière mise à jour est indiquée
                en haut de cette page.
              </p>
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