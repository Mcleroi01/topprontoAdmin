import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function Login() {
  const { t } = useTranslation()
  const { signIn, isAdmin, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Gérer la redirection après une connexion réussie
  useEffect(() => {
    if (isAdmin) {
      setShouldRedirect(true)
    }
  }, [isAdmin])

  // Afficher un indicateur de chargement pendant la vérification initiale
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté et est admin
  if (shouldRedirect || isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(t('auth.invalidCredentials'))
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(t('auth.loginError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Truck className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TopPronto Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={!email || !password || isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}