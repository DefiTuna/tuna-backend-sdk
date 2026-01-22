// Once https://github.com/hey-api/openapi-ts/issues/558 resolved, snake_case transform can be removed

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_CORE_GEN_PATH = path.resolve("src/client/client/client.gen.ts");
const CLIENT_SSE_GEN_PATH = path.resolve("src/client/core/serverSentEvents.gen.ts");
const MARKER = "// case-transformer-patch";

const patchClientCoreGen = async () => {
  const content = await readFile(CLIENT_CORE_GEN_PATH, "utf-8");

  if (content.includes(MARKER) && content.includes("applySseResponseTransforms")) {
    return;
  }

  const importLine = "import type {\n  Client,\n  Config,\n  RequestOptions,\n  ResolvedRequestOptions,\n} from './types.gen';";

  if (!content.includes(importLine)) {
    throw new Error("Unexpected client/client.gen.ts format: types import not found.");
  }

  let next = content.replace(
    importLine,
    `${importLine}\nimport { applyRequestCaseTransforms, applyResponseCaseTransforms } from '../../caseTransforms';\n${MARKER}`,
  );

  const beforeRequestBlock = `    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    if (opts.body !== undefined && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (opts.body === undefined || opts.serializedBody === '') {
      opts.headers.delete('Content-Type');
    }

    const url = buildUrl(opts);

    return { opts, url };
`;

  const updatedBeforeRequestBlock = `    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }

    const transformed = applyRequestCaseTransforms(opts);

    if (transformed.body !== undefined && transformed.bodySerializer) {
      transformed.serializedBody = transformed.bodySerializer(transformed.body);
    }

    // remove Content-Type header if body is empty to avoid sending invalid requests
    if (transformed.body === undefined || transformed.serializedBody === '') {
      transformed.headers.delete('Content-Type');
    }

    const url = buildUrl(transformed);

    return { opts: transformed, url };
`;

  if (!next.includes(beforeRequestBlock)) {
    throw new Error("Unexpected client/client.gen.ts format: beforeRequest block not found.");
  }

  next = next.replace(beforeRequestBlock, updatedBeforeRequestBlock);

  const responseBlock = `      if (parseAs === 'json') {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }
`;

  const updatedResponseBlock = `      if (parseAs === 'json') {
        data = applyResponseCaseTransforms(data);

        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }
`;

  if (!next.includes(responseBlock)) {
    throw new Error("Unexpected client/client.gen.ts format: response block not found.");
  }

  next = next.replace(responseBlock, updatedResponseBlock);
  next = next.replace("    // @ts-expect-error\n", "");

  await writeFile(CLIENT_CORE_GEN_PATH, next, "utf-8");
  console.log(`Patched ${path.relative(process.cwd(), CLIENT_CORE_GEN_PATH)}`);
};

await patchClientCoreGen();

const patchSseGen = async () => {
  const content = await readFile(CLIENT_SSE_GEN_PATH, "utf-8");

  if (content.includes(MARKER) && content.includes("applySseResponseTransforms")) {
    return;
  }

  const importLine = "import type { Config } from './types.gen';";

  if (!content.includes(importLine)) {
    throw new Error("Unexpected serverSentEvents.gen.ts format: types import not found.");
  }

  let next = content;

  if (!next.includes("applyResponseCaseTransforms")) {
    next = next.replace(
      importLine,
      `${importLine}\nimport { applyResponseCaseTransforms } from '../../caseTransforms';\nimport { applySseResponseTransforms } from '../../sseTransforms';\n${MARKER}`,
    );
  } else if (!next.includes("applySseResponseTransforms")) {
    next = next.replace(
      "import { applyResponseCaseTransforms } from '../../caseTransforms';",
      "import { applyResponseCaseTransforms } from '../../caseTransforms';\nimport { applySseResponseTransforms } from '../../sseTransforms';",
    );
  }

  const responseBlock = `              if (parsedJson) {
                if (responseValidator) {
                  await responseValidator(data);
                }

                if (responseTransformer) {
                  data = await responseTransformer(data);
                }
              }
`;

  const updatedResponseBlock = `              if (parsedJson) {
                data = applyResponseCaseTransforms(data);

                if (responseValidator) {
                  await responseValidator(data);
                }

                data = await applySseResponseTransforms(data);

                if (responseTransformer) {
                  data = await responseTransformer(data);
                }
              }
`;

  if (next.includes(responseBlock)) {
    next = next.replace(responseBlock, updatedResponseBlock);
  } else if (!next.includes("applySseResponseTransforms")) {
    throw new Error("Unexpected serverSentEvents.gen.ts format: response block not found.");
  }

  await writeFile(CLIENT_SSE_GEN_PATH, next, "utf-8");
  console.log(`Patched ${path.relative(process.cwd(), CLIENT_SSE_GEN_PATH)}`);
};

await patchSseGen();
