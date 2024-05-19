module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.errors.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/**/*.helper.ts',
    '!<rootDir>/src/**/*.adapter.ts',
    '!<rootDir>/src/**/*.factory.ts',
    '!<rootDir>/src/**/*.gateway.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/module-alias.ts',
    '!<rootDir>/src/**/routes.ts',
    '!<rootDir>/src/**/prisma.client.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  moduleNameMapper: {
    '@/(.+)': '<rootDir>/src/$1'
  },
  testMatch: ['**/*.spec.ts'],
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    '\\.ts$': 'ts-jest'
  },
  clearMocks: true,
}
