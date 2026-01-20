import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_GEN_PATH = path.resolve("src/client/client.gen.ts");
const CLIENT_CORE_GEN_PATH = path.resolve("src/client/client/client.gen.ts");
const MARKER = "// case-transformer-wrapper";

const wrapHelpers = () => `
${MARKER}
const wrapResponseTransformer = (
  transformer?: (data: unknown) => Promise<unknown>,
  validator?: (data: unknown) => Promise<unknown>,
) =>
  async (data: unknown) => {
    const camelized = applyResponseCaseTransforms(data);
    const transformed = transformer ? await transformer(camelized) : camelized;
    if (validator) {
      await validator(transformed);
    }
    return transformed;
  };

const wrapRequestOptions = (options: RequestOptions) => {
  const nextOptions = applyRequestCaseTransforms(options);
  const originalValidator = nextOptions.responseValidator;
  return {
    ...nextOptions,
    responseValidator: undefined,
    responseTransformer: wrapResponseTransformer(
      nextOptions.responseTransformer,
      originalValidator,
    ),
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
`.trimStart();

const patchClientGen = async () => {
  const content = await readFile(CLIENT_GEN_PATH, "utf-8");

  if (content.includes(MARKER)) {
    return;
  }

  const importLine = "import { type ClientOptions, type Config, createClient, createConfig } from './client';";
  const updatedImportLine =
    "import { type Client, type ClientOptions, type Config, type RequestOptions, createClient as createRawClient, createConfig } from './client';";

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

  const clientExportRegex = /export const client = createClient\(([^;]+)\);/;
  const match = next.match(clientExportRegex);

  if (!match) {
    throw new Error("Unexpected client.gen.ts format: client export not found.");
  }

  const createExpr = match[1];

  const wrapper = `${wrapHelpers()}
const baseClient = createRawClient(${createExpr});
export const client = wrapClient(baseClient);`;

  next = next.replace(clientExportRegex, wrapper);

  const createClientExport =
    "export const createClient = (config?: Config<ClientOptions2>) => wrapClient(createRawClient(config));";

  if (!next.includes(createClientExport)) {
    next = next.replace(
      "export type CreateClientConfig<T extends ClientOptions = ClientOptions2> = (override?: Config<ClientOptions & T>) => Config<Required<ClientOptions> & T>;\n",
      "export type CreateClientConfig<T extends ClientOptions = ClientOptions2> = (override?: Config<ClientOptions & T>) => Config<Required<ClientOptions> & T>;\n\n" +
        createClientExport +
        "\n",
    );
  }

  await writeFile(CLIENT_GEN_PATH, next, "utf-8");
  console.log(`Patched ${path.relative(process.cwd(), CLIENT_GEN_PATH)}`);
};

const patchClientCoreGen = async () => {
  const content = await readFile(CLIENT_CORE_GEN_PATH, "utf-8");

  if (content.includes(MARKER)) {
    return;
  }

  const importLine = "import type {\n  Client,\n  Config,\n  RequestOptions,\n  ResolvedRequestOptions,\n} from './types.gen';";

  if (!content.includes(importLine)) {
    throw new Error("Unexpected client/client.gen.ts format: types import not found.");
  }

  let next = content;

  if (!next.includes("import { applyRequestCaseTransforms, applyResponseCaseTransforms } from '../caseTransforms';")) {
    next = next.replace(
      importLine,
      `${importLine}\nimport { applyRequestCaseTransforms, applyResponseCaseTransforms } from '../caseTransforms';`,
    );
  }

  const createClientRegex = /export const createClient = \(config: Config = \{\}\): Client => \{/;
  if (!createClientRegex.test(next)) {
    throw new Error("Unexpected client/client.gen.ts format: createClient not found.");
  }

  next = next.replace(
    createClientRegex,
    "const createRawClient = (config: Config = {}): Client => {",
  );

  next += `\n\n${wrapHelpers()}export const createClient = (config: Config = {}): Client => wrapClient(createRawClient(config));\n`;

  await writeFile(CLIENT_CORE_GEN_PATH, next, "utf-8");
  console.log(`Patched ${path.relative(process.cwd(), CLIENT_CORE_GEN_PATH)}`);
};

await patchClientGen();
await patchClientCoreGen();
