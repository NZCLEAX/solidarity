import LegalDocument from '../components/LegalDocument'
import termsText from '../content/terms.txt?raw'

export default function TermsPage() {
  return (
    <LegalDocument
      title="Conditions d’utilisation"
      text={termsText}
      related={{ to: '/politique-confidentialite', label: 'Politique de confidentialité' }}
    />
  )
}