// Once https://github.com/hey-api/openapi-ts/issues/558 is resolved,
// snake_case request/response post-processing can be removed.

import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const toModulePath = absolutePath => {
  const rel = path.relative(path.resolve("src"), absolutePath).replace(/\\/g, "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

const resolveImportPath = (fromFile, toFile) => {
  const rel = path
    .relative(path.dirname(fromFile), toFile)
    .replace(/\\/g, "/")
    .replace(/\.(ts|js|mjs|cjs)$/i, "");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

const ensureImport = (content, symbols, importPath) => {
  const allSymbolsPresent = symbols.every(symbol => content.includes(symbol));
  if (allSymbolsPresent) return content;

  const typeImportPattern = /import type[\s\S]*?from '\.\/types\.gen';\n?/;
  const typeImport = content.match(typeImportPattern);
  if (!typeImport) {
    throw new Error(`Unexpected format in ${importPath}: types import not found.`);
  }
  return content.replace(
    typeImport[0],
    `${typeImport[0]}import { ${symbols.join(", ")} } from '${importPath}';\n`,
  );
};

const patchClientCoreGen = async () => {
  const candidates = [
    path.resolve("src/client/client/client.gen.ts"),
    path.resolve("src/client/client.gen.ts"),
  ];

  const existing = [];
  for (const file of candidates) {
    try {
      await access(file);
      existing.push(file);
    } catch {
      // noop
    }
  }

  if (!existing.length) {
    throw new Error("No generated client core file found.");
  }

  const caseTransformsPath = path.resolve("src/caseTransforms.ts");

  for (const file of existing) {
    let content = await readFile(file, "utf-8");
    const original = content;

    if (!content.includes("const beforeRequest = async")) {
      continue;
    }

    const importPath = resolveImportPath(file, caseTransformsPath);
    content = ensureImport(content, ["applyRequestCaseTransforms", "applyResponseCaseTransforms"], importPath);

    if (
      content.includes("const transformed = applyRequestCaseTransforms(opts);") &&
      content.includes("data = applyResponseCaseTransforms(data);")
    ) {
      continue;
    }

    const beforeRequestPattern =
      /if \(opts\.requestValidator\) \{\s*await opts\.requestValidator\(opts\);\s*\}\s*if \(opts\.body !== undefined && opts\.bodySerializer\) \{\s*opts\.serializedBody = opts\.bodySerializer\(opts\.body\);\s*\}\s*\/\/ remove Content-Type header if body is empty to avoid sending invalid requests\s*if \(opts\.body === undefined \|\| opts\.serializedBody === ''\) \{\s*opts\.headers\.delete\('Content-Type'\);\s*\}\s*const url = buildUrl\(opts\);\s*return \{ opts, url \};/m;

    content = content.replace(
      beforeRequestPattern,
      `if (opts.requestValidator) {
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

    return { opts: transformed, url };`,
    );

    if (!content.includes("const transformed = applyRequestCaseTransforms(opts);")) {
      throw new Error(`Unexpected format in ${toModulePath(file)}: beforeRequest block not found.`);
    }

    const jsonBlockPattern =
      /if \(parseAs === 'json'\) \{\s*(?!data = applyResponseCaseTransforms\(data\);)([\s\S]*?)\n\s*\}/m;

    content = content.replace(jsonBlockPattern, match => {
      const lines = match.split("\n");
      lines.splice(1, 0, "        data = applyResponseCaseTransforms(data);", "");
      return lines.join("\n");
    });

    if (!content.includes("data = applyResponseCaseTransforms(data);")) {
      throw new Error(`Unexpected format in ${toModulePath(file)}: JSON response block not found.`);
    }

    content = content.replace("    // @ts-expect-error\n", "");
    content = content.replace(/^\/\/ case-transformer-patch\n/gm, "");
    content = content.replace(/(from '\.\.\/\.\.\/caseTransforms)\.ts';/g, "$1';");

    if (content !== original) {
      await writeFile(file, content, "utf-8");
      console.log(`Patched ${toModulePath(file)}`);
    }
  }
};

const patchSseGen = async () => {
  const sseFile = path.resolve("src/client/core/serverSentEvents.gen.ts");
  const caseTransformsPath = path.resolve("src/caseTransforms.ts");
  const sseTransformsPath = path.resolve("src/sseTransforms.ts");

  let content = await readFile(sseFile, "utf-8");
  const original = content;
  const caseImportPath = resolveImportPath(sseFile, caseTransformsPath);
  const sseImportPath = resolveImportPath(sseFile, sseTransformsPath);

  content = ensureImport(content, ["applyResponseCaseTransforms"], caseImportPath);
  content = ensureImport(content, ["applySseResponseTransforms"], sseImportPath);

  if (!content.includes("data = applyResponseCaseTransforms(data);")) {
    const parsedJsonPattern = /if \(parsedJson\) \{\n/;
    if (!parsedJsonPattern.test(content)) {
      throw new Error(`Unexpected format in ${toModulePath(sseFile)}: parsedJson block not found.`);
    }
    content = content.replace(parsedJsonPattern, "if (parsedJson) {\n                data = applyResponseCaseTransforms(data);\n\n");
  }

  if (!content.includes("data = await applySseResponseTransforms(data);")) {
    const validatorBlockPattern =
      /if \(responseValidator\) \{\n\s*await responseValidator\(data\);\n\s*\}\n/m;
    if (!validatorBlockPattern.test(content)) {
      throw new Error(`Unexpected format in ${toModulePath(sseFile)}: responseValidator block not found.`);
    }
    content = content.replace(
      validatorBlockPattern,
      `if (responseValidator) {
                  await responseValidator(data);
                }

                data = await applySseResponseTransforms(data);
`,
    );
  }

  content = content.replace(/^\/\/ case-transformer-patch\n/gm, "");
  content = content.replace(/(from '\.\.\/\.\.\/caseTransforms)\.ts';/g, "$1';");
  content = content.replace(/(from '\.\.\/\.\.\/sseTransforms)\.ts';/g, "$1';");

  if (content !== original) {
    await writeFile(sseFile, content, "utf-8");
    console.log(`Patched ${toModulePath(sseFile)}`);
  }
};

await patchClientCoreGen();
await patchSseGen();
