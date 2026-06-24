import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import { supabase } from '@/lib/supabase'

type TotpFactor = {
  id: string
  status?: string | null
  friendly_name?: string | null
}

export function MfaRequiredPage() {
  const { user, isLoading } = useAuth()
  const [factorId, setFactorId] = useState('')
  const [existingFactor, setExistingFactor] = useState<TotpFactor | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [stepError, setStepError] = useState<string | null>(null)
  const [stepMessage, setStepMessage] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoadingFactors, setIsLoadingFactors] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadFactors() {
      setIsLoadingFactors(true)

      try {
        const { data, error } = await supabase.auth.mfa.listFactors()

        if (error) {
          throw error
        }

        const totpFactor = data.totp[0] as TotpFactor | undefined
        if (!isMounted) return

        if (totpFactor) {
          setExistingFactor(totpFactor)
          setFactorId(totpFactor.id)
          setStepMessage(
            'Un facteur MFA existe deja pour ce compte. Entre le code de ton application d authentification puis valide.'
          )
        } else {
          setExistingFactor(null)
          setFactorId('')
          setStepMessage(
            'Aucun facteur MFA detecte. Clique sur Activer la MFA pour generer un QR code.'
          )
        }
      } catch (err) {
        if (!isMounted) return
        setStepError(err instanceof Error ? err.message : 'Impossible de verifier les facteurs MFA.')
      } finally {
        if (isMounted) {
          setIsLoadingFactors(false)
        }
      }
    }

    void loadFactors()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">MFA requise</h1>
        <p className="text-sm text-gray-600">Chargement de la session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleStartEnrollment = async () => {
    setIsEnrolling(true)
    setStepError(null)
    setStepMessage(null)

    try {
      if (existingFactor) {
        setFactorId(existingFactor.id)
        setQrCode('')
        setStepMessage(
          'Un facteur MFA existe deja. Si ton application d authentification contient deja le compte, saisis simplement un code de verification.'
        )
        return
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })

      if (error) {
        throw error
      }

      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setStepMessage(
        'Scanne le QR code avec une application d authentification puis saisis le code a 6 chiffres.'
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de demarrer la MFA.'
      setStepError(message)

      if (message.includes('already exists')) {
        setStepMessage(
          'Un facteur MFA existe deja. Utilise le code de ton application d authentification.'
        )
      }
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleVerify = async () => {
    if (!factorId || !verificationCode.trim()) {
      setStepError('Entre le code de verification de ton application d authentification.')
      return
    }

    setIsVerifying(true)
    setStepError(null)
    setStepMessage(null)

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })

      if (challenge.error) {
        throw challenge.error
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode.trim(),
      })

      if (verify.error) {
        throw verify.error
      }

      await supabase.auth.refreshSession()
      window.location.assign('/dashboard')
    } catch (err) {
      setStepError(err instanceof Error ? err.message : 'Verification MFA impossible.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-md">
      <h1 className="mb-3 text-2xl font-bold text-gray-900">MFA requise</h1>
      <p className="text-sm text-gray-600">
        Ton compte admin doit activer la double authentification avant d acceder a l application.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-800">Etape 1</p>
        <p className="mt-1 text-sm text-gray-600">
          {existingFactor
            ? 'Un facteur existe deja. Tu peux verifier ton code directement.'
            : 'Clique sur le bouton ci-dessous pour generer le QR code TOTP.'}
        </p>

        <button
          type="button"
          onClick={() => void handleStartEnrollment()}
          disabled={isEnrolling || isLoadingFactors}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isEnrolling
            ? 'Traitement...'
            : existingFactor
              ? 'Utiliser le facteur existant'
              : 'Activer la MFA'}
        </button>
      </div>

      {qrCode ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-800">Etape 2</p>
          <p className="mt-1 text-sm text-gray-600">
            Scanne ce QR code avec Google Authenticator, Authy, 1Password ou une autre app TOTP.
          </p>

          <div className="mt-4 flex justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <img src={qrCode} alt="QR code MFA" className="h-56 w-56" />
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700">
          Code de verification
        </label>
        <input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={verificationCode}
          onChange={(event) => setVerificationCode(event.target.value)}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="123456"
        />

        <button
          type="button"
          onClick={() => void handleVerify()}
          disabled={isVerifying || isLoadingFactors}
          className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isVerifying ? 'Verification...' : 'Verifier et continuer'}
        </button>
      </div>

      {stepMessage ? (
        <p className="mt-4 text-sm text-emerald-700">{stepMessage}</p>
      ) : null}

      {stepError ? <p className="mt-4 text-sm text-red-600">{stepError}</p> : null}

      <p className="mt-6 text-xs text-gray-500">
        Si tu as deja enregistre le compte dans ton application d authentification, saisis simplement le code a 6 chiffres puis valide.
      </p>
    </div>
  )
}
