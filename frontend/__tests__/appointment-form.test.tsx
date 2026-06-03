import { render, screen } from '@testing-library/react'
import AppointmentFormPage from '@/app/appointments/[id]/page'

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({
    id: 'new',
  }),
}))

// Mock de axios
jest.mock('@/lib/axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}))

// Mock de localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = mockLocalStorage

// Mock de Sidebar
jest.mock('@/components/Sidebar', () => {
  return function MockSidebar({ isOpen, onToggle }: any) {
    return <div data-testid="sidebar">Mock Sidebar</div>
  }
})

describe('AppointmentFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente los campos requeridos del formulario de crear cita', () => {
    render(<AppointmentFormPage />)

    expect(screen.getByLabelText(/fecha programada/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/proveedor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/línea de producto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/observaciones/i)).toBeInTheDocument()
  })

  it('muestra el título "Nueva Cita" cuando es una cita nueva', () => {
    render(<AppointmentFormPage />)

    expect(screen.getByText(/nueva cita/i)).toBeInTheDocument()
  })
})
