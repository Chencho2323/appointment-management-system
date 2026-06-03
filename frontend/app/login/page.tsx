'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { LogIn, UserPlus, Calendar, BarChart3, Zap, LayoutDashboard, User, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Depuración: monitorear cambios en el error
  useEffect(() => {
    console.log('Error state changed:', error)
  }, [error])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/token/', {
        username,
        password,
      })

      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      router.push('/dashboard')
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión'
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos. Por favor verifica tus credenciales.'
        } else if (err.response.status === 400) {
          errorMessage = 'Datos inválidos. Por favor verifica que todos los campos estén completos.'
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.message) {
        if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
          errorMessage = 'No se puede conectar con el servidor. Por favor verifica tu conexión a internet o que el servidor esté activo.'
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/appointments/register/operator/', {
        username,
        password,
      })

      if (response.status === 201) {
        setPassword('')
        setIsLogin(true)
        alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.')
      }
    } catch (err: any) {
      let errorMessage = 'Error al registrar usuario'
      
      if (err.response) {
        if (err.response.status === 400) {
          if (err.response.data?.error) {
            errorMessage = err.response.data.error
          } else {
            errorMessage = 'Datos inválidos. El usuario ya existe o los datos son incorrectos.'
          }
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.message) {
        if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
          errorMessage = 'No se puede conectar con el servidor. Por favor verifica tu conexión a internet o que el servidor esté activo.'
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl min-h-[480px] relative">
        <div className="flex flex-col lg:flex-row min-h-[480px] relative">
          {/* Panel de bienvenida - cambia de lado según isLogin */}
          <div className={`w-full lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-400 items-center justify-center p-12 absolute inset-0 transition-all duration-500 ease-in-out ${isLogin ? 'left-0 lg:left-1/2' : 'left-0 lg:left-0'} z-10`}>
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{isLogin ? '¡Bienvenido!' : '¡Únete!'}</h1>
              <p className="text-lg mb-8">
                {isLogin ? 'Sistema de gestión de citas de entrega' : 'Regístrate como operador'}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <span className="text-left">
                    <p className="font-semibold">Gestión Eficiente</p>
                    <p className="text-sm opacity-80">Controla tus citas</p>
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <span className="text-left">
                    <p className="font-semibold">Reportes en Tiempo Real</p>
                    <p className="text-sm opacity-80">Analiza tus datos</p>
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-left">
                    <p className="font-semibold">Interfaz Moderna</p>
                    <p className="text-sm opacity-80">Fácil de usar</p>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de login - cambia de lado según isLogin */}
          <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 absolute inset-0 transition-all duration-500 ease-in-out ${isLogin ? 'left-0 lg:left-0' : 'left-0 lg:left-1/2'} z-20 bg-white overflow-y-auto`}>
            <div className="w-full max-w-md">
              <div className="space-y-5">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 transition-all duration-500">
                    {isLogin ? <UserPlus className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 transition-all duration-500">Sistema de Citas</h1>
                  <p className="text-gray-600 mt-2 text-xs transition-all duration-500">
                    {isLogin ? 'Inicia sesión para continuar' : 'Regístrate como operador'}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm relative">
                    <button
                      onClick={() => setError('')}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition"
                    >
                      ✕
                    </button>
                    {error}
                  </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                  <div className="transition-all duration-500">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition text-black"
                      placeholder="Ingresa tu usuario"
                      required
                    />
                  </div>

                  <div className="transition-all duration-500 delay-100">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition text-black"
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 active:scale-95"
                  >
                    {loading 
                      ? (isLogin ? 'Iniciando sesión...' : 'Registrando...') 
                      : (isLogin ? 'Iniciar Sesión' : 'Registrarse')
                    }
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setPassword('')
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition transform hover:scale-105"
                  >
                    {isLogin 
                      ? '¿No tienes cuenta? Regístrate como operador' 
                      : '¿Ya tienes cuenta? Inicia sesión'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
