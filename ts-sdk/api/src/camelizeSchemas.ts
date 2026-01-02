import type { OpenAPIObject, ReferenceObject, SchemaObject } from "openapi3-ts/oas31";

/**
 * Convert snake_case string to camelCase.
 *
 * This is used to transform JSON property names from the backend
 * wire format (snake_case) into frontend-friendly camelCase.
 */
const snakeToCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/**
 * Check whether a value is a plain object.
 *
 * We explicitly exclude arrays here, because:
 * - arrays are handled separately
 * - schema keywords (properties, items, etc.) are objects, not arrays
 *
 * This helper is intentionally minimal — it is only used for
 * OpenAPI schema traversal, not runtime JSON values.
 */
function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Converts OpenAPI schemas that represent BigInt values as string
 * into integer/int64 so they are mapped to `bigint` in orval.
 */
function normalizeBigIntSchema(schema: unknown) {
  if (!isObj(schema)) return;
  const ANY_INT_RE = /^(u?int)(8|16|32|64|128|256)$/;
  if (schema.type === "string" && typeof schema.format === "string" && ANY_INT_RE.test(schema.format)) {
    schema.type = "integer";
    schema.format = "int64";
  }
}

/**
 * =========================
 * Schema camelization logic
 * =========================
 *
 * Recursively transforms an OpenAPI SchemaObject by:
 * - converting property names from snake_case to camelCase
 * - keeping schema semantics intact
 *
 * IMPORTANT:
 * - This function operates on schema *definitions*, not on runtime data
 * - It does NOT touch:
 *   - path parameters
 *   - query parameters
 *   - request/response names
 * - Only JSON object property names are transformed
 */
function camelizeSchema(schema: unknown): unknown {
  // Non-objects (primitives, null, etc.) are returned as-is
  if (!isObj(schema)) return schema;

  normalizeBigIntSchema(schema);

  // Handle OpenAPI schema composition keywords.
  //
  // These are arrays of schemas, so we must recurse into each one.
  // Failing to do this would leave parts of the schema untransformed.
  for (const k of ["allOf", "oneOf", "anyOf"]) {
    if (Array.isArray(schema[k])) schema[k] = schema[k].map(camelizeSchema);
  }

  // Handle array item schemas.
  //
  // Example:
  //   type: array
  //   items:
  //     type: object
  //     properties: { ... }
  if (schema.items) schema.items = camelizeSchema(schema.items);

  // Handle additionalProperties schemas.
  //
  // This covers cases like:
  //   additionalProperties:
  //     type: object
  //     properties: { ... }
  if (schema.additionalProperties && isObj(schema.additionalProperties)) {
    schema.additionalProperties = camelizeSchema(schema.additionalProperties);
  }

  // Core transformation:
  // - properties
  // - required
  //
  // These two fields must always be kept in sync:
  //  - properties define the available object keys
  //  - required lists which of those keys are mandatory
  if (schema.properties && isObj(schema.properties)) {
    const newProps: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      const nk = snakeToCamel(key);
      newProps[nk] = camelizeSchema(val);
    }

    // Replace the properties object with the camelCase version
    schema.properties = newProps;

    // Update required fields to match the renamed properties.
    //
    // If we rename properties but forget to rename required,
    // the schema becomes invalid and code generators break.
    if (Array.isArray(schema.required)) {
      schema.required = schema.required.map((k: string) => snakeToCamel(k));
    }
  }

  return schema;
}

/**
 * Camelize query parameter names.
 *
 * This function:
 * - processes an OpenAPI `parameters` array
 * - converts query parameter names from snake_case to camelCase
 * - returns a new parameters array
 *
 * IMPORTANT:
 * - Only `in: query` parameters are affected
 * - Path, header and cookie parameters are left untouched
 * - Parameter schemas are not structurally modified here
 */
function camelizeParameters(params: unknown): unknown {
  // If there are no parameters or the value is not an array,
  // return it as-is.
  if (!Array.isArray(params)) return params;

  const result = params.map(p => {
    // Non-object parameters are returned unchanged
    if (!isObj(p)) return p;

    // We only care about query parameters with a string name
    if (p.in === "query" && typeof p.name === "string") {
      const camelName = snakeToCamel(p.name);

      // Only create a new object if the name actually changes
      if (camelName !== p.name) {
        return {
          ...p,
          name: camelName,
        };
      }
    }

    // No changes for this parameter
    return p;
  });

  // Avoid unnecessary allocations if nothing changed
  return result;
}

/**
 * =========================
 * OpenAPI transformer entry point
 * =========================
 *
 * This function is used by Orval as an input-level transformer.
 *
 * It receives the full OpenAPI document and must return a new one.
 * We intentionally:
 * - deep-clone the input
 * - mutate only the clone
 *
 * This keeps the original OpenAPI object untouched.
 */
export default function transformer(input: OpenAPIObject): OpenAPIObject {
  // Deep clone to avoid mutating Orval's internal OpenAPI representation
  const out: OpenAPIObject = structuredClone(input);

  // Schemas camelization
  const schemas = out.components?.schemas;
  if (schemas && isObj(schemas)) {
    for (const [name, schema] of Object.entries(schemas)) {
      schemas[name] = camelizeSchema(schema) as SchemaObject | ReferenceObject;
    }
  }

  // Query parameter camelization
  const paths = out.paths;
  if (paths && isObj(paths)) {
    for (const pathItem of Object.values(paths)) {
      if (!isObj(pathItem)) continue;

      for (const operation of Object.values(pathItem)) {
        if (!isObj(operation)) continue;

        operation.parameters = camelizeParameters(operation.parameters);
      }
    }
  }

  return out;
}
