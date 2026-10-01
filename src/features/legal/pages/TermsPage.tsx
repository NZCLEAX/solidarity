import { Link } from 'react-router-dom'

import PulseLogo from '@/shared/components/PulseLogo'

const sections = [
  {
    title: '1. Objet de PULSE',
    content: (
      <>
        <p>
          PULSE est une plateforme numérique destinée à faciliter la
          coordination des actions solidaires de terrain.
        </p>

        <p>
          La plateforme permet notamment, selon le rôle et les autorisations
          de l’utilisateur :
        </p>

        <ul>
          <li>de signaler des situations ou points nécessitant une intervention solidaire ;</li>
          <li>de visualiser des points sur une carte ;</li>
          <li>d’indiquer des besoins observés sur le terrain ;</li>
          <li>d’organiser et de suivre des interventions ;</li>
          <li>de coordonner les actions d’associations et de bénévoles ;</li>
          <li>de suivre certaines informations relatives à la couverture des besoins ;</li>
          <li>de limiter les doublons et la sur-couverture d’un même besoin ;</li>
          <li>de faciliter la coopération entre les différents acteurs de terrain.</li>
        </ul>

        <p>
          PULSE est un outil de coordination. La plateforme ne constitue pas
          un service d’urgence, un service médical, un service social officiel
          ou un service de secours.
        </p>

        <p>
          En cas d’urgence ou de danger immédiat, l’utilisateur doit contacter
          les services publics compétents.
        </p>
      </>
    ),
  },
  {
    title: '2. Éditeur et contact',
    content: (
      <>
        <p>
          PULSE est éditée à titre non professionnel par une personne physique.
        </p>

        <p>
          L’éditeur a choisi de préserver son anonymat conformément aux
          dispositions applicables aux services de communication au public en ligne.
        </p>

        <p>
          Site : <strong>humanspulse.fr</strong>
        </p>

        <p>
          Contact :{' '}
          <a
            href="mailto:humans.pulsee@gmail.com"
            className="font-bold text-[#d94a0b] underline"
          >
            humans.pulsee@gmail.com
          </a>
        </p>

        <p>
          Les informations relatives à l’hébergement de PULSE sont disponibles
          dans les Mentions légales de la plateforme.
        </p>
      </>
    ),
  },
  {
    title: '3. Acceptation des CGU',
    content: (
      <>
        <p>
          La création d’un compte PULSE implique l’acceptation préalable des
          présentes Conditions Générales d’Utilisation.
        </p>

        <p>
          Lors de l’inscription, l’utilisateur doit confirmer qu’il accepte
          les présentes CGU et qu’il a pu consulter la Politique de confidentialité.
        </p>

        <p>
          Si l’utilisateur refuse les présentes CGU, il ne peut pas créer ou
          utiliser un compte PULSE.
        </p>
      </>
    ),
  },
  {
    title: '4. Création d’un compte',
    content: (
      <>
        <p>
          Certaines fonctionnalités de PULSE nécessitent la création d’un compte.
          L’utilisateur s’engage à fournir des informations exactes, sincères et à jour.
        </p>

        <p>L’utilisateur est notamment responsable :</p>

        <ul>
          <li>de l’exactitude des informations communiquées ;</li>
          <li>de la confidentialité de son mot de passe ;</li>
          <li>de la sécurité de son compte ;</li>
          <li>des actions réalisées depuis son compte.</li>
        </ul>

        <p>
          L’utilisateur ne doit pas communiquer ses identifiants à une autre personne.
        </p>
      </>
    ),
  },
  {
    title: '5. Confirmation de l’adresse e-mail',
    content: (
      <>
        <p>
          PULSE peut demander à l’utilisateur de confirmer son adresse e-mail
          afin d’activer son compte.
        </p>

        <p>
          Certains messages nécessaires au fonctionnement du compte peuvent
          être envoyés par e-mail, notamment pour la confirmation de
          l’inscription, la réinitialisation du mot de passe et la sécurité du compte.
        </p>
      </>
    ),
  },
  {
    title: '6. Rôles et niveaux d’accès',
    content: (
      <>
        <p>PULSE peut attribuer différents rôles aux utilisateurs :</p>

        <ul>
          <li>citoyen ;</li>
          <li>bénévole ;</li>
          <li>association ;</li>
          <li>modérateur ;</li>
          <li>administrateur.</li>
        </ul>

        <p>
          Les fonctionnalités accessibles dépendent du rôle, du statut du compte
          et, lorsque cela est nécessaire, du rattachement à une association.
        </p>
      </>
    ),
  },
  {
    title: '7. Obligations des utilisateurs',
    content: (
      <>
        <p>
          Chaque utilisateur s’engage à utiliser PULSE de manière responsable,
          licite et respectueuse.
        </p>

        <p>Il est notamment interdit :</p>

        <ul>
          <li>d’utiliser PULSE à des fins frauduleuses ;</li>
          <li>de transmettre volontairement de fausses informations ;</li>
          <li>d’usurper l’identité d’une personne ou d’une organisation ;</li>
          <li>de détourner les fonctionnalités de la plateforme ;</li>
          <li>de tenter d’accéder à des données non autorisées ;</li>
          <li>de compromettre ou tenter de compromettre la sécurité de PULSE ;</li>
          <li>de publier du contenu malveillant ou illicite ;</li>
          <li>d’utiliser les informations de PULSE pour harceler ou discriminer une personne.</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. Signalements',
    content: (
      <>
        <p>
          Les utilisateurs autorisés peuvent créer des signalements afin
          d’indiquer une situation nécessitant potentiellement une action solidaire.
        </p>

        <p>
          Les informations renseignées doivent être limitées à ce qui est
          réellement nécessaire à la coordination de l’action.
        </p>

        <p>
          Sauf nécessité légitime et juridiquement autorisée, il ne doit pas
          être renseigné dans un signalement :
        </p>

        <ul>
          <li>le nom complet d’une personne accompagnée ;</li>
          <li>son numéro de téléphone personnel ;</li>
          <li>son adresse e-mail personnelle ;</li>
          <li>des documents d’identité ;</li>
          <li>des informations médicales ;</li>
          <li>des informations sur ses convictions religieuses ou politiques ;</li>
          <li>son origine ethnique ;</li>
          <li>son orientation sexuelle ;</li>
          <li>toute autre donnée sensible inutile à l’intervention.</li>
        </ul>

        <p>
          PULSE a vocation à localiser un besoin ou une situation de terrain,
          et non à constituer un fichier nominatif des personnes accompagnées.
        </p>
      </>
    ),
  },
  {
    title: '9. Géolocalisation et adresses',
    content: (
      <>
        <p>
          Certaines fonctionnalités de PULSE utilisent des adresses ou
          coordonnées géographiques afin de positionner des points sur la carte.
        </p>

        <p>
          La précision géographique utilisée doit rester proportionnée à ce qui
          est nécessaire pour organiser une intervention.
        </p>
      </>
    ),
  },
  {
    title: '10. Informations relatives aux besoins',
    content: (
      <>
        <p>
          Les utilisateurs peuvent renseigner les besoins observés sur le terrain,
          notamment des besoins en repas, eau, vêtements, produits d’hygiène,
          couvertures ou autres formes d’aide.
        </p>

        <p>
          Ces informations peuvent évoluer rapidement. Les utilisateurs sont
          invités à vérifier les informations utiles avant d’organiser une intervention.
        </p>
      </>
    ),
  },
  {
    title: '11. Interventions',
    content: (
      <>
        <p>
          Les utilisateurs disposant des autorisations nécessaires peuvent
          créer ou déclarer des interventions.
        </p>

        <p>
          Les informations renseignées doivent correspondre autant que possible
          à l’action prévue ou effectivement réalisée.
        </p>

        <p>
          Il est interdit de créer volontairement de fausses interventions ou
          de manipuler les informations relatives aux besoins couverts.
        </p>
      </>
    ),
  },
  {
    title: '12. Associations',
    content: (
      <>
        <p>
          Une organisation souhaitant bénéficier des fonctionnalités réservées
          aux associations peut être soumise à une procédure de vérification.
        </p>

        <p>
          Une association utilisant PULSE demeure responsable de l’organisation
          de ses actions, de ses bénévoles, de ses décisions d’intervention et
          du respect de ses propres obligations.
        </p>
      </>
    ),
  },
  {
    title: '13. Bénévoles',
    content: (
      <>
        <p>
          Un bénévole peut être rattaché à une association selon les règles de PULSE.
        </p>

        <p>
          L’accès à certaines fonctionnalités peut dépendre de la validation de
          ce rattachement.
        </p>
      </>
    ),
  },
  {
    title: '14. Modération',
    content: (
      <>
        <p>PULSE peut mettre en place des mécanismes permettant notamment :</p>

        <ul>
          <li>de vérifier certains signalements ;</li>
          <li>de détecter les doublons ;</li>
          <li>de corriger des informations manifestement erronées ;</li>
          <li>de désactiver ou archiver certains points ;</li>
          <li>de supprimer certains contenus ;</li>
          <li>d’intervenir en cas d’utilisation abusive.</li>
        </ul>
      </>
    ),
  },
  {
    title: '15. Absence de garantie d’intervention',
    content: (
      <>
        <p>
          La création d’un signalement sur PULSE ne garantit pas qu’une
          association, un bénévole ou un autre utilisateur interviendra.
        </p>

        <p>
          PULSE ne garantit aucun délai d’intervention, aucune prise en charge
          systématique ni aucune quantité particulière d’aide.
        </p>
      </>
    ),
  },
  {
    title: '16. Fiabilité des informations',
    content: (
      <>
        <p>
          Une partie des informations présentes sur PULSE est renseignée par
          les utilisateurs.
        </p>

        <p>
          Malgré les mécanismes de vérification ou de modération pouvant être
          mis en place, PULSE ne peut garantir que toutes les informations soient
          constamment exactes, exhaustives ou actualisées.
        </p>
      </>
    ),
  },
  {
    title: '17. Respect des personnes accompagnées',
    content: (
      <>
        <p>
          L’utilisation de PULSE doit respecter la dignité, la vie privée et
          les droits des personnes en situation de précarité.
        </p>

        <p>Il est notamment interdit :</p>

        <ul>
          <li>de harceler une personne ;</li>
          <li>de diffuser des informations permettant inutilement de l’identifier ;</li>
          <li>d’exploiter commercialement sa situation ;</li>
          <li>de porter atteinte à sa dignité ;</li>
          <li>d’exercer une discrimination.</li>
        </ul>
      </>
    ),
  },
  {
    title: '18. Données personnelles',
    content: (
      <>
        <p>
          PULSE peut traiter certaines données personnelles nécessaires à son fonctionnement.
        </p>

        <p>
          Les modalités de collecte, d’utilisation et de protection de ces
          données sont détaillées dans la Politique de confidentialité.
        </p>
      </>
    ),
  },
  {
    title: '19. Sécurité',
    content: (
      <>
        <p>
          PULSE met en œuvre des mesures techniques et organisationnelles
          destinées à limiter les accès non autorisés, modifications illégitimes,
          pertes et divulgations non autorisées.
        </p>

        <p>
          Aucun système informatique ne peut toutefois garantir une sécurité absolue.
        </p>
      </>
    ),
  },
  {
    title: '20. Propriété intellectuelle',
    content: (
      <>
        <p>
          Sauf indication contraire, le nom PULSE, ses interfaces, ses éléments
          graphiques, ses textes et les autres éléments originaux de la plateforme
          peuvent être protégés par les règles relatives à la propriété intellectuelle.
        </p>

        <p>
          L’utilisation de PULSE ne confère aucun droit de propriété sur ces éléments.
        </p>
      </>
    ),
  },
  {
    title: '21. Contenus fournis par les utilisateurs',
    content: (
      <>
        <p>
          L’utilisateur reste responsable des informations et contenus qu’il
          transmet sur PULSE.
        </p>

        <p>
          Il autorise PULSE à les traiter dans la mesure nécessaire au
          fonctionnement de la plateforme, notamment pour leur enregistrement,
          leur affichage aux utilisateurs autorisés et leur modération.
        </p>
      </>
    ),
  },
  {
    title: '22. Disponibilité du service',
    content: (
      <>
        <p>
          PULSE peut être temporairement indisponible en raison d’opérations
          de maintenance, de mises à jour, d’améliorations techniques ou
          d’incidents.
        </p>

        <p>
          Une disponibilité permanente et ininterrompue ne peut être garantie.
        </p>
      </>
    ),
  },
  {
    title: '23. Évolution des fonctionnalités',
    content: (
      <>
        <p>
          Les fonctionnalités de PULSE peuvent être ajoutées, modifiées,
          remplacées, suspendues ou supprimées afin de faire évoluer la plateforme.
        </p>
      </>
    ),
  },
  {
    title: '24. Suspension d’un compte',
    content: (
      <>
        <p>Un compte peut notamment être suspendu en cas :</p>

        <ul>
          <li>de suspicion de fraude ;</li>
          <li>d’utilisation abusive ;</li>
          <li>de tentative d’accès non autorisé ;</li>
          <li>de non-respect des présentes CGU ;</li>
          <li>de risque pour la sécurité de la plateforme.</li>
        </ul>
      </>
    ),
  },
  {
    title: '25. Suppression d’un compte',
    content: (
      <>
        <p>
          L’utilisateur peut demander la suppression de son compte selon les
          fonctionnalités disponibles dans PULSE.
        </p>

        <p>
          Certaines informations liées à des actions déjà réalisées peuvent
          être conservées sous une forme dissociée du compte lorsqu’une telle
          conservation est nécessaire.
        </p>
      </>
    ),
  },
  {
    title: '26. Responsabilité',
    content: (
      <>
        <p>PULSE constitue un outil d’aide à la coordination.</p>

        <p>
          Dans les limites prévues par la réglementation applicable, l’éditeur
          ne peut notamment être tenu responsable des conséquences résultant :
        </p>

        <ul>
          <li>d’informations erronées renseignées par un utilisateur ;</li>
          <li>d’un signalement devenu obsolète ;</li>
          <li>de l’absence d’intervention d’une association ;</li>
          <li>d’une mauvaise utilisation de la plateforme ;</li>
          <li>d’actions réalisées indépendamment par une association ou un bénévole ;</li>
          <li>d’une interruption temporaire du service.</li>
        </ul>

        <p>
          Cette clause n’a pas pour objet d’exclure une responsabilité qui ne
          pourrait légalement être exclue.
        </p>
      </>
    ),
  },
  {
    title: '27. Services tiers',
    content: (
      <>
        <p>
          Le fonctionnement de PULSE peut reposer sur différents services
          techniques tiers pour l’hébergement, l’authentification, la base de
          données, l’envoi d’e-mails ou le déploiement de l’application.
        </p>
      </>
    ),
  },
  {
    title: '28. Liens externes',
    content: (
      <>
        <p>
          PULSE peut contenir des liens vers des sites ou services externes.
          PULSE ne contrôle pas nécessairement ces services et n’est pas
          responsable de leur contenu.
        </p>
      </>
    ),
  },
  {
    title: '29. Modification des CGU',
    content: (
      <>
        <p>
          Les présentes CGU peuvent évoluer afin de tenir compte de
          modifications de PULSE, de nouvelles fonctionnalités ou de nouvelles
          obligations applicables.
        </p>

        <p>
          En cas de modification importante, une nouvelle acceptation pourra
          être demandée aux utilisateurs.
        </p>
      </>
    ),
  },
  {
    title: '30. Droit applicable',
    content: (
      <>
        <p>
          Les présentes Conditions Générales d’Utilisation sont soumises au droit français.
        </p>

        <p>
          En cas de difficulté, les parties sont invitées à rechercher
          préalablement une solution amiable.
        </p>
      </>
    ),
  },
  {
    title: '31. Contact',
    content: (
      <>
        <p>
          Pour toute question relative à PULSE ou aux présentes Conditions
          Générales d’Utilisation :
        </p>

        <a
          href="mailto:humans.pulsee@gmail.com"
          className="font-black text-[#d94a0b] underline"
        >
          humans.pulsee@gmail.com
        </a>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:py-12">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex justify-center">
          <PulseLogo className="h-14 w-auto" />
        </div>

        <main className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-800 px-6 py-8 sm:px-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#d94a0b]">
              PULSE
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Conditions Générales d’Utilisation
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Version 1.0 — Mise à jour : 1er octobre 2026
            </p>

            <p className="mt-6 max-w-3xl leading-7 text-slate-300">
              Les présentes Conditions Générales d’Utilisation définissent les
              conditions d’accès et d’utilisation de PULSE.
            </p>
          </div>

          <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border-b border-slate-800 pb-10 last:border-b-0 last:pb-0"
              >
                <h2 className="text-xl font-black text-white">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4 leading-7 text-slate-300 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </main>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            to="/politique-confidentialite"
            className="font-bold text-slate-300 hover:text-[#d94a0b]"
          >
            Politique de confidentialité
          </Link>

          <Link
            to="/mentions-legales"
            className="font-bold text-slate-300 hover:text-[#d94a0b]"
          >
            Mentions légales
          </Link>
        </div>

        <Link
          to="/register"
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
        >
          Retour à l’inscription
        </Link>

      </div>
    </div>
  )
}