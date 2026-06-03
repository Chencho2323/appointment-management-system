const nextJest = require('next/jest')

const createJestConfig = nextJest({
// Proporcione la ruta a su aplicación Next.js para cargar los archivos next.config.js y .env en su entorno de prueba.  dir: './',
})

// Agrega cualquier configuración personalizada que se pasará a Jest.
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfig se exporta de esta manera para garantizar que next/jest pueda cargar la configuración Next.js que es asíncrona
module.exports = createJestConfig(customJestConfig)
