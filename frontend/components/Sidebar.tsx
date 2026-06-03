'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/axios'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (refreshToken) {
        // Llamar al endpoint de logout para blacklisear el refresh token
        await api.post('/auth/logout/', { refresh: refreshToken })
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Siempre limpiar los tokens y redirigir al login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    // Cerrar el menú en móvil después de navegar
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle?.()
    }
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Calendar,
      label: 'Citas',
      path: '/appointments',
    },
    {
      icon: FileText,
      label: 'Reportes',
      path: '/report',
    },
  ]

  return (
    <>
      {/* Botón de hamburguesa para móvil cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="lg:hidden fixed top-4 left-4 z-50 bg-primary-600 text-white p-3 rounded-lg shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay oscuro para móvil cuando está abierto */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          lg:relative fixed left-0 top-0 h-full bg-white shadow-xl z-40 transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'lg:w-20 w-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <div className="flex items-center space-x-2 animate-fade-in">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-800">Citas</span>
              </div>
            )}
            <button
              onClick={onToggle}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-800 transform hover:scale-105"
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-gray-800 transform hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de navegación */}
          {isOpen && (
            <nav className="flex-1 p-4 space-y-2 animate-slide-up">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 transform hover:scale-105
                      ${isActive 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {/* Footer del Sidebar */}
          {isOpen && (
            <div className="p-4 border-t border-gray-200 animate-fade-in">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
