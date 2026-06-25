import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { signUp } from '../api/auth'
import { publicRegisterRoles, type PublicRegisterRole } from '../utils/roles'
import { isValidPassword, passwordValidationMessage } from '../utils/passwordValidation'

const publicRoleValues = publicRegisterRoles.map((r) => r.value) as [string, ...string[]]

const registerSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est obligatoire.' }),
  email: z.string().email({ message: 'L’email est invalide.' }),
  role: z.enum(publicRoleValues),
  password: z.string().refine(isValidPassword, {
    message: passwordValidationMessage,
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'citoyen',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RegisterFormValues) => signUp(data.email, data.password, data.name, data.role),
    onSuccess: () => {
      navigate('/dashboard')
    },
    onError: (err: any) => {
      setServerError(err.message || "Erreur d'inscription")
    },
  })

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    setServerError(null)
    mutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Inscription</h1>
        <p className="text-slate-500 mb-6">Crée ton compte.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom"
            {...register('name')}
            className="border rounded-lg px-3 py-2"
          />
          {errors.name && <p className="text-sm text-red-500 -mt-3">{errors.name.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="border rounded-lg px-3 py-2"
          />
          {errors.email && <p className="text-sm text-red-500 -mt-3">{errors.email.message}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Type de compte
            </label>

            <select
              {...register('role')}
              className="w-full rounded-lg border px-3 py-2"
            >
              {publicRegisterRoles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="Mot de passe"
              {...register('password')}
              className="border rounded-lg px-3 py-2"
            />
            {errors.password ? (<p className="text-sm text-red-500">{errors.password.message}</p>) : (
              <p className="text-xs text-slate-500">
                15 caractères minimum, avec au moins une majuscule, une minuscule et un chiffre.
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {isSubmitting ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-600 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}