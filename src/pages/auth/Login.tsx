import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const { signIn, isAdmin, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInitialCheck, setIsInitialCheck] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    console.log('Login useEffect - isAdmin:', isAdmin, 'authLoading:', authLoading)
    
    if (authLoading) {
      console.log('Auth is still loading...')
      return
    }
    
    if (isAdmin) {
      console.log('User is admin, redirecting to /')
      navigate('/', { replace: true })
    } else {
      console.log('User is not admin or not logged in, showing login form')
      setIsInitialCheck(false)
    }
  }, [isAdmin, authLoading, navigate])

  if (authLoading || isInitialCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-600">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted', { email })
    setLoading(true)
    setError('')

    try {
      console.log('Calling signIn...')
      const { data, error } = await signIn(email, password)
      console.log('signIn response:', { data, error })
      
      if (error) {
        console.error('Login error:', error)
        setError('Credenciais inválidas. Por favor, tente novamente.')
      } else {
        console.log('Login successful, waiting for auth state update...')
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError('Credenciais inválidas. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Partie gauche - Formulaire */}

      <div className="hidden md:block md:w-1/2 relative bg-gradient-to-r from-green-800 to-green-700">
        <div className="absolute inset-0 bg-[url('/images/inicio.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="mb-8">
            <img 
              src="/images/logo/logo (3).png" 
              alt="Topronto Logo" 
              className="h-32 w-auto mx-auto mb-6"
            />
            <h2 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-4">Topronto</h2>
            <p className="text-xl text-white/90">Gerencie sua frota de transporte com eficiência</p>
          </div>
          <div className="mt-auto">
            <p className="text-sm text-white/70">Solução completa de gestão de frotas</p>
          </div>
        </div>
      </div>
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-20"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">Bem-vindo</h1>
            <p className="text-gray-600 text-lg">Faça login para acessar sua área administrativa</p>
          </div>

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-6" 
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="pt-2"
            >
              <Button
                type="submit"
                className="w-full py-3 text-base font-medium rounded-lg bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                loading={loading}
                disabled={!email || !password}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="relative z-10">
                    Entrar
                    {isHovered && (
                      <motion.span 
                        className="absolute inset-0 bg-white/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>
          
          <div className="mt-10 text-center text-sm text-gray-500">
            <p> {new Date().getFullYear()} TopPronto. Todos os direitos reservados.</p>
          </div>
        </div>
      </motion.div>

      {/* Partie droite - Image de fond avec logo */}
     
    </div>
  )
}