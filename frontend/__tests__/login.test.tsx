import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock de axios
jest.mock('@/lib/axios', () => ({
  post: jest.fn(),
}))

// Mock de localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = mockLocalStorage

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente los campos del formulario de login', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error cuando las credenciales son incorrectas', async () => {
    const { post } = require('@/lib/axios')
    post.mockRejectedValue({
      response: {
        status: 401,
      },
    })

    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(usernameInput, { target: { value: 'usuario_invalido' } })
    fireEvent.change(passwordInput, { target: { value: 'password_invalido' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument()
    })
  })
})
