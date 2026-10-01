import { Link } from 'react-router-dom'

const linkClass = 'font-bold text-[var(--app-orange)] underline underline-offset-4'

function SupportEmail() {
  return <a href="mailto:humans.pulsee@gmail.com" className={`${linkClass} break-all`}>humans.pulsee@gmail.com</a>
}

const sections = [
  {
    id: 'connexion',
    title: 'Se connecter à son compte',
    content: <>
      <p>Pour accéder à Pulse, connectez-vous avec l’adresse e-mail et le mot de passe utilisés lors de votre inscription.</p>
      <p>Si vous rencontrez une difficulté :</p>
      <ul>
        <li>vérifiez que votre adresse e-mail est correctement saisie ;</li>
        <li>vérifiez votre mot de passe, notamment les majuscules ;</li>
        <li>assurez-vous que votre connexion Internet fonctionne ;</li>
        <li>si le problème persiste, contactez le support.</li>
      </ul>
      <p>Ne communiquez jamais votre mot de passe ni vos codes de connexion.</p>
    </>,
  },
  {
    id: 'acces',
    title: 'Comprendre ses accès',
    content: <>
      <p>Les fonctionnalités disponibles dépendent de votre rôle et des autorisations associées à votre compte.</p>
      <p>Certains accès peuvent nécessiter la validation de votre inscription ou de votre rattachement à une association.</p>
      <p>Si une fonctionnalité vous semble inaccessible, rapprochez-vous du responsable de votre association ou du support de Pulse.</p>
    </>,
  },
  {
    id: 'signalements',
    title: 'Signaler une situation sur la carte',
    content: <>
      <p>Lors de la création d’un point, renseignez une description claire, les besoins identifiés et une localisation suffisamment précise pour permettre une intervention.</p>
      <p>Veillez à :</p>
      <ul>
        <li>fournir des informations aussi exactes et récentes que possible ;</li>
        <li>préciser lorsqu’une information n’a pas été vérifiée ;</li>
        <li>éviter les doublons en consultant les points déjà présents ;</li>
        <li>limiter les données personnelles partagées au strict nécessaire ;</li>
        <li>éviter toute information susceptible d’exposer une personne à un risque.</li>
      </ul>
      <p>Si un point semble incorrect, obsolète ou présent plusieurs fois, transmettez sa référence à un modérateur ou au support.</p>
    </>,
  },
  {
    id: 'associations',
    title: 'Rejoindre une association et participer aux actions',
    content: <>
      <p>L’accès aux équipes, aux interventions et aux informations de coordination dépend de votre rôle et des autorisations accordées par votre association.</p>
      <p>Pour toute question concernant une demande d’adhésion, une intervention ou l’organisation d’une équipe, contactez en priorité le responsable de l’association concernée.</p>
      <p>Avant de participer à une action, vérifiez les informations disponibles, notamment le lieu, les horaires et les besoins indiqués.</p>
    </>,
  },
  {
    id: 'terrain',
    title: 'Mettre à jour les informations de terrain',
    content: <>
      <p>Les situations et les besoins peuvent évoluer rapidement.</p>
      <p>Si vos autorisations le permettent, actualisez les informations d’un point ou d’une intervention lorsqu’un changement survient. Une intervention terminée ou annulée doit être signalée comme telle afin de faciliter la coordination.</p>
      <p>Si vous ne pouvez pas effectuer la modification, contactez une personne autorisée ou le support en précisant l’information à corriger.</p>
    </>,
  },
  {
    id: 'problemes-techniques',
    title: 'Résoudre un problème technique',
    content: <>
      <p>Si une page ne s’affiche pas correctement ou qu’une action échoue :</p>
      <ul>
        <li>vérifiez votre connexion Internet ;</li>
        <li>conservez les informations saisies qui ne sont pas encore enregistrées ;</li>
        <li>rechargez la page ;</li>
        <li>si nécessaire, fermez puis rouvrez votre navigateur.</li>
      </ul>
      <p>Si le problème persiste, contactez le support en précisant :</p>
      <ul>
        <li>la page ou la fonctionnalité concernée ;</li>
        <li>l’action que vous tentiez de réaliser ;</li>
        <li>le message d’erreur affiché ;</li>
        <li>la date et l’heure approximatives du problème ;</li>
        <li>votre navigateur et le type d’appareil utilisé.</li>
      </ul>
      <p>Vous pouvez joindre une capture d’écran en masquant les données personnelles et les informations confidentielles.</p>
    </>,
  },
  {
    id: 'moderation',
    title: 'Signaler un contenu ou un comportement inapproprié',
    content: <>
      <p>Si vous constatez un contenu trompeur, abusif, discriminatoire ou susceptible de mettre une personne en danger, contactez la modération ou le support de Pulse.</p>
      <p>Indiquez le contenu concerné et expliquez le motif de votre signalement. Transmettez uniquement les informations nécessaires à son examen.</p>
    </>,
  },
  {
    id: 'securite',
    title: 'Protéger son compte',
    content: <>
      <p>Choisissez un mot de passe suffisamment sécurisé et évitez de le réutiliser sur d’autres services.</p>
      <p>Si vous soupçonnez une utilisation non autorisée de votre compte, contactez rapidement le support. Si vous pouvez encore accéder à vos réglages, modifiez votre mot de passe.</p>
      <p>Ne transmettez jamais votre mot de passe ni vos codes de connexion, y compris dans une demande d’assistance.</p>
    </>,
  },
  {
    id: 'donnees-personnelles',
    title: 'Gérer ses données personnelles',
    content: <>
      <p>Pour comprendre comment vos données sont utilisées et connaître les modalités d’exercice de vos droits, consultez la <Link to="/politique-confidentialite" className={linkClass}>Politique de confidentialité</Link>, accessible depuis les réglages.</p>
      <p>Les règles d’utilisation de Pulse sont détaillées dans les <Link to="/conditions-utilisation" className={linkClass}>Conditions d’utilisation</Link>.</p>
      <p>Pour toute demande concernant vos données personnelles ou la suppression de votre compte, vous pouvez écrire à <SupportEmail />.</p>
    </>,
  },
  {
    id: 'contact',
    title: 'Contacter le support',
    content: <>
      <p>Pour toute question, difficulté technique ou demande d’assistance, contactez-nous à l’adresse suivante :</p>
      <p><SupportEmail /></p>
      <p>Utilisez un objet explicite, par exemple : « Problème de connexion », « Demande d’adhésion » ou « Erreur sur un point ».</p>
      <p>Décrivez votre demande aussi précisément que possible et indiquez, si nécessaire, l’adresse e-mail associée à votre compte. Évitez d’envoyer plusieurs messages pour un même problème ; vous pouvez compléter votre demande en répondant à votre premier e-mail.</p>
    </>,
  },
  {
    id: 'urgence',
    title: 'Situation d’urgence',
    content: <>
      <p>Pulse est un outil de coordination et de solidarité. En cas de danger immédiat, contactez directement les services d’urgence compétents.</p>
      <p className="font-bold">N’attendez pas une réponse du support pour demander de l’aide.</p>
    </>,
  },
]

export default function SupportPage() {
  return (
    <main lang="fr" dir="ltr" className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/settings" className={`${linkClass} inline-flex min-h-11 items-center`}>← Retour aux réglages</Link>
        <header id="support-top" className="mb-8 mt-5 scroll-mt-6 rounded-3xl border border-[var(--app-border)] border-t-4 border-t-[var(--app-orange)] bg-[var(--app-surface)] p-6 sm:p-10">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--app-orange)]">Pulse · Assistance</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Aide et support</h1>
          <p className="mt-5 max-w-2xl leading-7 text-[var(--app-muted)]">Besoin d’aide pour utiliser Pulse ? Retrouvez ici les réponses aux questions courantes et les informations utiles pour contacter notre équipe.</p>
          <a href="mailto:humans.pulsee@gmail.com" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#d94a0b] px-5 py-3 font-bold text-white transition hover:bg-[#b93607]">Contacter le support par e-mail</a>
        </header>
        <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
          <nav aria-label="Sommaire de l’aide" className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider">Comment pouvons-nous vous aider ?</h2>
            <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {sections.map((section, index) => <li key={section.id}>
                <a href={`#${section.id}`} className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm leading-snug hover:bg-[var(--app-surface-soft)]">
                  <span aria-hidden="true" className="text-xs font-bold tabular-nums text-[var(--app-orange)]">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </a>
              </li>)}
            </ol>
          </nav>
          <div className="min-w-0 space-y-5">
            {sections.map((section, index) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
              <div className="mb-6 flex items-start gap-4 border-b border-[var(--app-border-soft)] pb-5">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-sm font-extrabold text-[var(--app-orange)]">{String(index + 1).padStart(2, '0')}</span>
                <h2 id={`${section.id}-title`} className="pt-1 text-xl font-bold tracking-tight sm:text-2xl">{section.title}</h2>
              </div>
              <div className="space-y-4 break-words leading-7 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:rounded-xl [&_ul]:bg-[var(--app-surface-soft)] [&_ul]:py-4 [&_ul]:pl-9 [&_ul]:pr-5">{section.content}</div>
            </section>)}
            <footer className="flex flex-wrap justify-between gap-4 px-2 py-5 text-sm">
              <Link to="/settings" className={linkClass}>Retour aux réglages</Link>
              <a href="#support-top" className={linkClass}>Retour en haut ↑</a>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
