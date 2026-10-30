
const fs = require('node:fs')

function read(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Fichier introuvable : ${path}`)
  }
  return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
}

function replaceRequired(source, original, replacement, label) {
  if (!source.includes(original)) {
    throw new Error(
      `Modification impossible : ${label}. Aucun fichier n'a été enregistré.`
    )
  }
  return source.replace(original, replacement)
}

const mapPath = 'src/features/map/pages/MapPage.tsx'
const loginPath = 'src/features/auth/pages/LoginPage.tsx'
const registerPath = 'src/features/auth/pages/RegisterPage.tsx'
const interventionsPath =
  'src/features/interventions/pages/InterventionsPage.tsx'
const authPath = 'src/features/auth/utils/mobileAuth.ts'

let map = read(mapPath)
let login = read(loginPath)
let register = read(registerPath)
let interventions = read(interventionsPath)
read(authPath)

// 1. CARTE : NE GARDER QUE LES INTERVENTIONS ACTIVES

map = replaceRequired(
  map,
  "import { getRepasCoverage } from '@/features/map/utils/coverage'",
  "import { getRepasCoverage } from '@/features/map/utils/coverage'\nimport { getInterventionEndDate } from '@/features/interventions/utils/interventionDates'",
  'import des dates'
)

map = replaceRequired(
  map,
  'export default function MapPage() {',
  `function isActiveMapIntervention(
  intervention: Intervention,
  now: Date
) {
  if (
    intervention.statut !== 'prevue' &&
    intervention.statut !== 'en_cours'
  ) {
    return false
  }

  const endDate = getInterventionEndDate(intervention)

  return (
    endDate !== null &&
    endDate.getTime() >= now.getTime()
  )
}

export default function MapPage() {`,
  'filtrage des interventions'
)

map = replaceRequired(
  map,
  '  const [mobilePoint, setMobilePoint] =\n    useState<any | null>(null)',
  `  const [mobilePoint, setMobilePoint] =
    useState<any | null>(null)

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 30000)

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])`,
  'actualisation automatique'
)

map = replaceRequired(
  map,
  '    interventions.forEach((intervention) => {\n      if (!intervention.point_id) return',
  `    interventions.forEach((intervention) => {
      if (!intervention.point_id) return
      if (!isActiveMapIntervention(intervention, now)) return`,
  'exclusion des anciennes interventions'
)

map = replaceRequired(
  map,
  '    return grouped\n  }, [interventions])',
  '    return grouped\n  }, [interventions, now])',
  'mise à jour des regroupements'
)

// 2. RECALCULER UNE FICHE OUVERTE

map = replaceRequired(
  map,
  '  const availableNeeds = useMemo(() => {',
  `  useEffect(() => {
    setMobilePoint((current: any | null) => {
      if (!current) return null

      const point = pointsWithCoordinates.find(
        (item) => String(item.id) === String(current.id)
      )

      if (!point) return null

      const pointInterventions =
        interventionsByPointId[point.id] ?? []

      return {
        ...point,
        pointInterventions,

        totalRepas: pointInterventions.reduce(
          (total, item) =>
            total + (item.nombre_repas ?? 0),
          0
        ),

        totalBenevoles: pointInterventions.reduce(
          (total, item) =>
            total + (item.nombre_benevoles ?? 0),
          0
        ),

        repasCoverage: getRepasCoverage(
          point.nombre_personnes_estime,
          pointInterventions
        ),

        hasRepasNeed:
          point.besoins?.toLowerCase().includes('repas') ??
          false,

        latestIntervention: pointInterventions[0],
      }
    })
  }, [pointsWithCoordinates, interventionsByPointId])

  const availableNeeds = useMemo(() => {`,
  'actualisation de la fiche'
)

// 3. CORRIGER LA HAUTEUR ET LE DÉFILEMENT DE LA CARTE

map = replaceRequired(
  map,
  'className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#faf8f4]"',
  'className="relative h-full w-full overflow-hidden bg-[#faf8f4]"',
  'hauteur de carte'
)

map = replaceRequired(
  map,
  'className="fixed inset-x-0 bottom-24 top-20 z-[2000] overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-6 pt-4 shadow-2xl ring-1 ring-slate-200 sm:hidden"',
  'className="absolute inset-x-0 bottom-24 top-0 z-[2000] overscroll-contain overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-6 pt-4 shadow-2xl ring-1 ring-slate-200 sm:hidden"',
  'fiche sous le header'
)

map = replaceRequired(
  map,
  'className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1"',
  'className="mt-3 space-y-2 pr-1"',
  'défilement associations'
)

// 4. EMPÊCHER LE ZOOM AUTOMATIQUE DES CHAMPS IPHONE

login = replaceRequired(
  login,
  'px-4 py-3 text-sm outline-none',
  'px-4 py-3 text-base outline-none',
  'champ email'
)

login = replaceRequired(
  login,
  'px-4 py-3 text-sm outline-none',
  'px-4 py-3 text-base outline-none',
  'champ mot de passe'
)

const registerInput =
  'min-h-12 w-full min-w-0 rounded-lg border px-3 py-2'

if (!register.includes(registerInput)) {
  throw new Error("Champs d'inscription introuvables.")
}

register = register.replaceAll(
  registerInput,
  registerInput + ' text-base'
)

// 5. CORRIGER LES ACCENTS MAL ENCODÉS

const characterFixes = new Map([
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ãª', 'ê'],
  ['Ã«', 'ë'],
  ['Ã ', 'à'],
  ['Ã¢', 'â'],
  ['Ã®', 'î'],
  ['Ã¯', 'ï'],
  ['Ã´', 'ô'],
  ['Ã¶', 'ö'],
  ['Ã¹', 'ù'],
  ['Ã»', 'û'],
  ['Ã§', 'ç'],
  ['Ã‰', 'É'],
  ['Ã€', 'À'],
  ['Ã‡', 'Ç'],
  ['â€™', '’'],
  ['â€œ', '“'],
  ['â€¢', '•'],
  ['â€“', '–'],
  ['â€”', '—'],
])

for (const [broken, correct] of characterFixes) {
  interventions = interventions.replaceAll(
    broken,
    correct
  )
}

// 6. RETOUR APPLE SANS RECHARGEMENT DE L'APPLICATION

const nativeAuth = `import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

import { router } from '@/app/router'
import { supabase } from '@/lib/supabase'

let initialized = false
let handlingCallback = false

function isAppleCallback(url: string): boolean {
  try {
    const parsed = new URL(url)

    return (
      parsed.protocol === 'fr.humanspulse.app:' &&
      parsed.hostname === 'auth' &&
      parsed.pathname === '/callback'
    )
  } catch {
    return false
  }
}

async function handleAuthCallback(url: string) {
  if (!isAppleCallback(url) || handlingCallback) return

  handlingCallback = true

  try {
    const callbackUrl = new URL(url)

    const authError =
      callbackUrl.searchParams.get('error_description') ||
      callbackUrl.searchParams.get('error')

    if (authError) {
      throw new Error(authError)
    }

    const code = callbackUrl.searchParams.get('code')

    if (!code) {
      throw new Error(
        'Retour Apple sans code OAuth. Vérifie les Redirect URLs Supabase.'
      )
    }

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    await Browser.close().catch(() => undefined)

    await router.navigate('/login?oauth=complete', {
      replace: true,
    })
  } catch (error) {
    console.error('Erreur OAuth Apple dans PULSE :', error)

    await Browser.close().catch(() => undefined)

    await router.navigate('/login?oauth=error', {
      replace: true,
    })
  } finally {
    handlingCallback = false
  }
}

export async function initializeMobileAuth() {
  if (!Capacitor.isNativePlatform() || initialized) {
    return
  }

  initialized = true

  await App.addListener('appUrlOpen', ({ url }) => {
    void handleAuthCallback(url)
  })

  const launch = await App.getLaunchUrl()

  if (launch?.url) {
    void handleAuthCallback(launch.url)
  }
}
`

// 7. ENREGISTRER TOUS LES FICHIERS

const writes = [
  [mapPath, map],
  [loginPath, login],
  [registerPath, register],
  [interventionsPath, interventions],
  [authPath, nativeAuth],
]

for (const [file, content] of writes) {
  fs.writeFileSync(file, content, 'utf8')
  console.log('Corrigé : ' + file)
}

console.log('Corrections terminées.')
console.log('Lance maintenant : npm run build')
