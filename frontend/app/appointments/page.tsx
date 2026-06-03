'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import Sidebar from '@/components/Sidebar'
import { Plus, Edit, Trash2, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
  id: number
  scheduled_at: string
  delivered_at: string | null
  status: string
  supplier: string
  product_line: string
  created_by_username: string
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    supplier: '',
    product_line: '',
    status: '',
  })
  const initialized = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    // Verificar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search)
    const statusParam = urlParams.get('status')
    if (statusParam) {
      setFilters(prev => ({ ...prev, status: statusParam }))
      setShowFilters(true)
    }

    fetchAppointments()
    initialized.current = true
  }, [router])

  // Volver a cargar citas cuando cambien los filtros
  useEffect(() => {
    if (initialized.current) {
      fetchAppointments()
    }
  }, [filters])

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/appointments/?${params}`)
      setAppointments(response.data.results || response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Error al cargar citas')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return

    try {
      await api.delete(`/appointments/${id}/`)
      fetchAppointments()
    } catch (err: any) {
      let errorMessage = 'Error al eliminar cita'
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.status === 404) {
        errorMessage = 'Cita no encontrada'
      } else if (err.response?.status === 400) {
        errorMessage = 'No se puede eliminar esta cita en su estado actual'
      }
      setError(errorMessage)
    }
  }

  const handleFilter = () => {
    setLoading(true)
    fetchAppointments()
  }

  const statusColors = {
    Programada: 'bg-blue-100 text-blue-800',
    'En Proceso': 'bg-yellow-100 text-yellow-800',
    Entregada: 'bg-green-100 text-green-800',
    Cancelada: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
            <p className="text-gray-600 mt-2">Gestión de citas de entrega</p>
          </div>
          <button
            onClick={() => router.push('/appointments/new')}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Cita
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 hover:text-gray-900 mb-4"
          >
            <Filter className="w-5 h-5 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  value={filters.supplier}
                  onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-black"
                >
                  <option value="">Todos</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Línea</label>
                <select
                  value={filters.product_line}
                  onChange={(e) => setFilters({ ...filters, product_line: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-black"
                >
                  <option value="">Todas</option>
                  <option value="Camisetas">Camisetas</option>
                  <option value="Pantalones">Pantalones</option>
                  <option value="Zapatos">Zapatos</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-black"
                >
                  <option value="">Todos</option>
                  <option value="Programada">Programada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-3 lg:col-span-5">
                <button
                  onClick={handleFilter}
                  className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Programada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado por
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay citas registradas
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(appointment.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.product_line}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.created_by_username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/appointments/${appointment.id}`)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
