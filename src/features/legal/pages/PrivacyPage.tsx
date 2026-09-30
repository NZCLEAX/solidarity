import LegalDocument from '../components/LegalDocument'
import privacyText from '../content/privacy.txt?raw'

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Politique de confidentialité"
      text={privacyText}
      related={{ to: '/conditions-utilisation', label: 'Conditions d’utilisation' }}
    />
  )
}
