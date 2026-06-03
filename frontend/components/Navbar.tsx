'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, Calendar, BarChart3, Menu, X } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Sistema de Citas</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => router.push('/appointments')}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Citas
              </button>
              <button
                onClick={() => router.push('/report')}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Reporte
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                router.push('/dashboard')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <LayoutDashboard className="w-4 h-4 mr-2 inline" />
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/appointments')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Citas
            </button>
            <button
              onClick={() => {
                router.push('/report')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Reporte
            </button>
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              <LogOut className="w-4 h-4 mr-2 inline" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
