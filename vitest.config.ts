import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
    allowOnly: false,
    reporters: ['default', 'junit'],
    outputFile: { junit: 'reports/unit.xml' },
  },
})
