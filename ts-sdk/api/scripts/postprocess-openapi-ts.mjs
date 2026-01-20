import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_GEN_PATH = path.resolve("src/client/client.gen.ts");
const MARKER = "// case-transformer-wrapper";

const content = await readFile(CLIENT_GEN_PATH, "utf-8");

if (content.includes(MARKER)) {
  process.exit(0);
}

const importLine = "import { type ClientOptions, type Config, createClient, createConfig } from './client';";
const updatedImportLine =
  "import { type Client, type ClientOptions, type Config, type RequestOptions, createClient, createConfig } from './client';";

if (!content.includes(importLine)) {
  throw new Error("Unexpected client.gen.ts format: import line not found.");
}

let next = content.replace(importLine, updatedImportLine);

if (!next.includes("import { applyRequestCaseTransforms, applyResponseCaseTransforms } from './caseTransforms';")) {
  next = next.replace(
    updatedImportLine,
    `${updatedImportLine}\nimport { applyRequestCaseTransforms, applyResponseCaseTransforms } from './caseTransforms';`,
  );
}

const clientExportRegex = /export const client = createClient\\(([^;]+)\\);/;
const match = next.match(clientExportRegex);

if (!match) {
  throw new Error("Unexpected client.gen.ts format: client export not found.");
}

const createExpr = match[1];

const wrapper = `${MARKER}
const baseClient = createClient(${createExpr});

const wrapResponseTransformer = (transformer?: (data: unknown) => Promise<unknown>) =>
  async (data: unknown) => applyResponseCaseTransforms(transformer ? await transformer(data) : data);

const wrapRequestOptions = (options: RequestOptions) => {
  const nextOptions = applyRequestCaseTransforms(options);
  return {
    ...nextOptions,
    responseTransformer: wrapResponseTransformer(nextOptions.responseTransformer),
  };
};

const wrapClient = (client: Client): Client => {
  const wrapMethod =
    (method: string) =>
    (options: RequestOptions) =>
      client.request({ ...wrapRequestOptions(options), method });

  return {
    ...client,
    request: (options: RequestOptions) => client.request(wrapRequestOptions(options)),
    connect: wrapMethod("CONNECT"),
    delete: wrapMethod("DELETE"),
    get: wrapMethod("GET"),
    head: wrapMethod("HEAD"),
    options: wrapMethod("OPTIONS"),
    patch: wrapMethod("PATCH"),
    post: wrapMethod("POST"),
    put: wrapMethod("PUT"),
    trace: wrapMethod("TRACE"),
  };
};

export const client = wrapClient(baseClient);`;

next = next.replace(clientExportRegex, wrapper);

await writeFile(CLIENT_GEN_PATH, next, "utf-8");
console.log(`Patched ${path.relative(process.cwd(), CLIENT_GEN_PATH)}`);
