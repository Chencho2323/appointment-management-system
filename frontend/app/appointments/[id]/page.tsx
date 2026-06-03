'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/axios'
import Sidebar from '@/components/Sidebar'
import { ArrowLeft, Save } from 'lucide-react'

interface Appointment {
  id: string
  scheduled_at: string
  delivered_at: string | null
  status: string
  supplier: string
  product_line: string
  observations: string
}

export default function AppointmentFormPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isEdit = id !== 'new'
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [formData, setFormData] = useState({
    scheduled_at: '',
    delivered_at: '',
    status: 'Programada',
    supplier: '',
    product_line: '',
    observations: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    if (isEdit) {
      fetchAppointment()
    }
  }, [id, isEdit, router])

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${id}/`)
      const data = response.data
      setFormData({
        scheduled_at: data.scheduled_at ? data.scheduled_at.slice(0, 16) : '',
        delivered_at: data.delivered_at ? data.delivered_at.slice(0, 16) : '',
        status: data.status,
        supplier: data.supplier,
        product_line: data.product_line,
        observations: data.observations || '',
      })
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setFetchError('Error al cargar la cita')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        delivered_at: formData.delivered_at ? new Date(formData.delivered_at).toISOString() : null,
      }

      if (isEdit) {
        await api.put(`/appointments/${id}/`, payload)
        setSuccess('Cita actualizada exitosamente')
      } else {
        await api.post('/appointments/', payload)
        setSuccess('Cita creada exitosamente')
      }

      setTimeout(() => {
        router.push('/appointments')
      }, 1500)
    } catch (err: any) {
      let errorMessage = 'Error al guardar la cita'
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Cita no encontrada'
        } else if (err.response.status === 400) {
          const errorData = err.response?.data
          if (typeof errorData === 'object') {
            const errors = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ')
            errorMessage = errors
          } else {
            errorMessage = errorData || 'Error de validación'
          }
        } else if (err.response.status === 401) {
          errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.'
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.message) {
        if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
          errorMessage = 'No se puede conectar con el servidor. Por favor verifica tu conexión a internet.'
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/appointments')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Citas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Cita' : 'Nueva Cita'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Actualiza la información de la cita' : 'Registra una nueva cita de entrega'}
          </p>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {fetchError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Programada *
                </label>
                <input
                  id="scheduled_at"
                  name="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="delivered_at" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  id="delivered_at"
                  name="delivered_at"
                  type="datetime-local"
                  value={formData.delivered_at}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requerido cuando el estado es "Entregada"
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  required
                >
                  <option value="Programada">Programada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <select
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label htmlFor="product_line" className="block text-sm font-medium text-gray-700 mb-2">
                  Línea de Producto *
                </label>
                <select
                  id="product_line"
                  name="product_line"
                  value={formData.product_line}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Seleccionar línea de producto</option>
                  <option value="Camisetas">Camisetas</option>
                  <option value="Pantalones">Pantalones</option>
                  <option value="Zapatos">Zapatos</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                placeholder="Observaciones adicionales sobre la cita..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/appointments')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
