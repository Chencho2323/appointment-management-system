'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import Sidebar from '@/components/Sidebar'
import { LayoutDashboard, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface DashboardStats {
  total_appointments: number
  today_appointments: number
  status_counts: {
    Programada: number
    'En Proceso': number
    Entregada: number
    Cancelada: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await api.get('/appointments/dashboard/')
      setStats(response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Error al cargar estadísticas')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  const statusColors = {
    Programada: 'bg-blue-500',
    'En Proceso': 'bg-yellow-500',
    Entregada: 'bg-green-500',
    Cancelada: 'bg-red-500',
  }

  const statusIcons = {
    Programada: Calendar,
    'En Proceso': Clock,
    Entregada: CheckCircle,
    Cancelada: XCircle,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Resumen general del sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-full">
                  <LayoutDashboard className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Citas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.today_appointments || 0}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => router.push('/appointments?status=Entregada')}
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entregadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.status_counts?.Entregada || 0}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => router.push('/appointments?status=En%20Proceso')}
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.status_counts['En Proceso'] || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Citas por Estado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats?.status_counts || {}).map(([status, count]) => {
                const Icon = statusIcons[status as keyof typeof statusIcons] || AlertCircle
                return (
                  <div 
                    key={status} 
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => router.push(`/appointments?status=${encodeURIComponent(status)}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 ${statusColors[status as keyof typeof statusColors]} rounded-full`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">{status}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/appointments')}
              className="bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Ver Todas las Citas
            </button>
            <button
              onClick={() => router.push('/report')}
              className="bg-white text-primary-600 py-3 px-6 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition font-medium"
            >
              Ver Reporte de Tiempos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
