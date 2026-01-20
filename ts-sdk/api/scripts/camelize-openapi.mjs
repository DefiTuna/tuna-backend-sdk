import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";

const INPUT_PATH = path.resolve("openapi.yaml");
const OUTPUT_PATH = path.resolve("openapi.camel.yaml");

const snakeToCamel = (value) => value.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

const isObj = (value) => !!value && typeof value === "object" && !Array.isArray(value);

const camelizePathTemplate = (value) =>
  value.replace(/\{([^}]+)\}/g, (_match, inner) => `{${snakeToCamel(inner)}}`);

const camelizeSchema = (schema) => {
  if (!isObj(schema)) return schema;

  for (const key of ["allOf", "oneOf", "anyOf"]) {
    if (Array.isArray(schema[key])) {
      schema[key] = schema[key].map(camelizeSchema);
    }
  }

  if (schema.items) {
    schema.items = camelizeSchema(schema.items);
  }

  if (schema.additionalProperties && isObj(schema.additionalProperties)) {
    schema.additionalProperties = camelizeSchema(schema.additionalProperties);
  }

  if (schema.properties && isObj(schema.properties)) {
    const nextProps = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      nextProps[snakeToCamel(key)] = camelizeSchema(value);
    }
    schema.properties = nextProps;

    if (Array.isArray(schema.required)) {
      schema.required = schema.required.map((key) => snakeToCamel(key));
    }
  }

  return schema;
};

const camelizeParameters = (params) => {
  if (!Array.isArray(params)) return params;

  return params.map((param) => {
    if (!isObj(param)) return param;

    if ((param.in === "query" || param.in === "path") && typeof param.name === "string") {
      param.name = snakeToCamel(param.name);
    }

    if (param.schema) {
      param.schema = camelizeSchema(param.schema);
    }

    return param;
  });
};

const camelizeContentSchemas = (content) => {
  if (!isObj(content)) return;
  for (const media of Object.values(content)) {
    if (!isObj(media)) continue;
    if (media.schema) {
      media.schema = camelizeSchema(media.schema);
    }
  }
};

const camelizeRequestBody = (requestBody) => {
  if (!isObj(requestBody)) return;
  if (requestBody.content) {
    camelizeContentSchemas(requestBody.content);
  }
};

const camelizeResponse = (response) => {
  if (!isObj(response)) return;
  if (response.content) {
    camelizeContentSchemas(response.content);
  }
};

const camelizePathItem = (pathItem) => {
  if (!isObj(pathItem)) return;

  if (pathItem.parameters) {
    pathItem.parameters = camelizeParameters(pathItem.parameters);
  }

  for (const operation of Object.values(pathItem)) {
    if (!isObj(operation)) continue;

    if (operation.parameters) {
      operation.parameters = camelizeParameters(operation.parameters);
    }

    if (operation.requestBody) {
      camelizeRequestBody(operation.requestBody);
    }

    if (operation.responses && isObj(operation.responses)) {
      for (const response of Object.values(operation.responses)) {
        camelizeResponse(response);
      }
    }
  }
};

const camelizeComponents = (components) => {
  if (!isObj(components)) return;

  if (components.schemas && isObj(components.schemas)) {
    for (const [key, schema] of Object.entries(components.schemas)) {
      components.schemas[key] = camelizeSchema(schema);
    }
  }

  if (components.parameters && isObj(components.parameters)) {
    for (const [key, param] of Object.entries(components.parameters)) {
      components.parameters[key] = camelizeParameters([param])[0];
    }
  }

  if (components.requestBodies && isObj(components.requestBodies)) {
    for (const [key, requestBody] of Object.entries(components.requestBodies)) {
      camelizeRequestBody(requestBody);
      components.requestBodies[key] = requestBody;
    }
  }

  if (components.responses && isObj(components.responses)) {
    for (const [key, response] of Object.entries(components.responses)) {
      camelizeResponse(response);
      components.responses[key] = response;
    }
  }
};

const inputText = await readFile(INPUT_PATH, "utf-8");
const spec = yaml.parse(inputText);

if (!spec || typeof spec !== "object") {
  throw new Error("Failed to parse OpenAPI spec.");
}

if (spec.paths && isObj(spec.paths)) {
  const nextPaths = {};
  for (const [rawPath, pathItem] of Object.entries(spec.paths)) {
    const nextPath = camelizePathTemplate(rawPath);
    camelizePathItem(pathItem);
    nextPaths[nextPath] = pathItem;
  }
  spec.paths = nextPaths;
}

camelizeComponents(spec.components);

const outputText = yaml.stringify(spec);
await writeFile(OUTPUT_PATH, outputText, "utf-8");

console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
