import type { AssociationDocumentType } from '@/features/associations/api/associations'
import type { OfficialAssociationData } from '@/features/associations/api/officialVerification'

export type VerificationContext = {
  nom: string
  siren: string
  siret: string
  rna: string
  representantNom: string
  officialData: OfficialAssociationData | null
}

export type DocumentVerificationResult = {
  type: AssociationDocumentType
  fileName: string
  isValid: boolean
  score: number
  notes: string[]
  extractedText: string
}

export type AssociationVerificationResult = {
  score: number
  status: 'en_attente_documents' | 'verification_manuelle' | 'pre_verifiee'
  notes: string[]
  documents: DocumentVerificationResult[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

const documentRules: Record<
  AssociationDocumentType,
  {
    maxScore: number
    required: boolean
    keywords: string[]
  }
> = {
  statuts: {
    maxScore: 20,
    required: true,
    keywords: ['statuts', 'association', 'objet', 'siège', 'siege'],
  },
  recepisse: {
    maxScore: 15,
    required: true,
    keywords: ['récépissé', 'recepisse', 'préfecture', 'prefecture', 'rna'],
  },
  pv_bureau: {
    maxScore: 10,
    required: true,
    keywords: ['procès-verbal', 'proces-verbal', 'assemblée', 'bureau', 'président', 'president'],
  },
  attestation: {
    maxScore: 10,
    required: false,
    keywords: ['attestation', 'honneur', 'représentant', 'representant'],
  },
  assurance: {
    maxScore: 10,
    required: false,
    keywords: ['assurance', 'responsabilité civile', 'responsabilite civile'],
  },
  autre: {
    maxScore: 5,
    required: false,
    keywords: [],
  },
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

async function extractPdfText(file: File) {
  const text = await file.text()
  return text.trim()
}

export async function verifyDocumentFile(
  type: AssociationDocumentType,
  file: File,
  context: VerificationContext
): Promise<DocumentVerificationResult> {
  const rules = documentRules[type]
  const notes: string[] = []
  let score = 0

  if (file.type !== 'application/pdf') {
    return {
      type,
      fileName: file.name,
      isValid: false,
      score: 0,
      notes: ['Le fichier doit être au format PDF.'],
      extractedText: '',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      type,
      fileName: file.name,
      isValid: false,
      score: 0,
      notes: ['Le fichier dépasse 10 Mo.'],
      extractedText: '',
    }
  }

  score += Math.round(rules.maxScore * 0.25)
  notes.push('Format PDF valide.')

  const extractedText = await extractPdfText(file)
  const normalizedText = normalizeText(extractedText)

  if (extractedText.length < 50) {
    notes.push('Le texte du document est difficile à lire.')
  } else {
    score += Math.round(rules.maxScore * 0.25)
    notes.push('Texte lisible détecté dans le PDF.')
  }

  const matchedKeywords = rules.keywords.filter((keyword) =>
    normalizedText.includes(normalizeText(keyword))
  )

  if (rules.keywords.length === 0 || matchedKeywords.length > 0) {
    score += Math.round(rules.maxScore * 0.25)
    notes.push('Mots-clés attendus détectés.')
  } else {
    notes.push('Mots-clés attendus non trouvés.')
  }

  const expectedValues = [
    context.nom,
    context.siren,
    context.siret,
    context.rna,
    context.representantNom,
  ].filter(Boolean)

  const matchedExpectedValue = expectedValues.some((value) =>
    normalizedText.includes(normalizeText(value))
  )

  if (matchedExpectedValue) {
    score += Math.round(rules.maxScore * 0.25)
    notes.push('Le document semble cohérent avec les informations saisies.')
  } else {
    notes.push('Aucune information saisie n’a été retrouvée dans le document.')
  }

  return {
    type,
    fileName: file.name,
    isValid: score >= Math.round(rules.maxScore * 0.5),
    score: Math.min(score, rules.maxScore),
    notes,
    extractedText,
  }
}

export async function verifyAssociationDossier(
  context: VerificationContext,
  documents: Partial<Record<AssociationDocumentType, File>>
): Promise<AssociationVerificationResult> {
  const notes: string[] = []
  const results: DocumentVerificationResult[] = []
  let score = 0

  if (context.siren || context.siret || context.rna) {
    score += 25
    notes.push('Identifiant administratif renseigné.')
  } else {
    notes.push('SIREN, SIRET ou RNA manquant.')
  }

  if (context.officialData?.officialName) {
    score += 20
    notes.push('Données officielles récupérées automatiquement.')
  } else {
    notes.push('Données officielles non vérifiées.')
  }

  if (context.officialData?.officialCity) {
    score += 10
    notes.push('Ville officielle récupérée.')
  }

  for (const [type, rules] of Object.entries(documentRules)) {
    const documentType = type as AssociationDocumentType
    const file = documents[documentType]

    if (!file) {
      if (rules.required) {
        notes.push(`${documentType} manquant.`)
      }
      continue
    }

    const result = await verifyDocumentFile(documentType, file, context)
    results.push(result)
    score += result.score
  }

  let status: AssociationVerificationResult['status'] = 'en_attente_documents'

  if (score >= 80) {
    status = 'pre_verifiee'
  } else if (score >= 50) {
    status = 'verification_manuelle'
  }

  return {
    score: Math.min(score, 100),
    status,
    notes,
    documents: results,
  }
}
