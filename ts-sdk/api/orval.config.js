import { defineConfig } from 'orval';

export default defineConfig({
  tuna: {
    input: {
      target: './openapi.yaml',
      override: {
        transformer: './src/camelizeSchemas.ts',
      },
    },
    output: {
      client: 'fetch',
      target: 'src',
      fileExtension: '.gen.ts',
      override: {
        useBigInt: true,
        useDates: true,
        mutator: {
          path: './src/customFetch.ts',
          name: 'customFetch',
        },
        namingConvention: {
          enum: 'camelCase',
        },
      },
    },
  }});