# DefiTuna SDK

## Overview

This package provides a TypeScript SDK for the DefiTuna public API. The SDK is generated from OpenAPI using `@hey-api/openapi-ts` and exposes a class-based client plus typed helpers.

## Installation

```bash
# NPM
npm install @crypticdot/defituna-api
# Yarn
yarn add @crypticdot/defituna-api
# PNPM
pnpm add @crypticdot/defituna-api
```

## Usage

```ts
import { TunaBackendSdk, createClient, unwrap } from "@crypticdot/defituna-api";

const client = createClient({ baseUrl: "https://api.defituna.com/api" });
const sdk = new TunaBackendSdk({ client });

const positions = await unwrap(
  sdk.getTunaPositions({
    path: { userAddress: "CYCf8sBj4zLZheRovh37rWLe7pK8Yn5G7nb4SeBmgfMG" },
  }),
);
```

## How the SDK works

- Generation source: `openapi.yaml` is the canonical spec.
- Pre-processing: `scripts/camelize-openapi.mjs` produces `openapi.camel.yaml` (converts snake_case into cameCase).
- Code generation: `@hey-api/openapi-ts` generates `src/client/**`.
- Post-processing: `scripts/postprocess-openapi-ts.mjs` patches the generated client to:
  - snake_case request payloads/params
  - camelCase response payloads
  - apply response transforms before validators where needed
  - apply custom SSE transforms (see below)

## Case transforms and scalar transforms

- Requests: payloads and query params are snake_cased in `src/caseTransforms.ts`.
- Responses: payloads are camelCased and then transformed for BigInt/Date via generated transformers.

## SSE streams

SSE response transforms are maintained manually in `src/sseTransforms.ts`. The upstream transformer plugin does not handle the SSE union schema, so any changes to SSE payloads must be reflected here.

If you add or modify SSE event types in `openapi.yaml`:
1) Update the SSE schemas and discriminator mapping.
2) Regenerate the SDK (`pnpm generate`).
3) Update `src/sseTransforms.ts` to apply the correct transforms for the new event type.

## Maintenance workflow

1) Update `openapi.yaml`.
2) Run `pnpm generate` (or `pnpm openapi-ts`).
3) Verify generated output and postprocess changes.
4) Update `src/sseTransforms.ts` if SSE payloads changed.
5) Run `pnpm run lint` and `pnpm run test`.
