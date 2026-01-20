const snakeToCamel = (value: string) =>
  value.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const camelToSnake = (value: string) =>
  value.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;

const mapKeysDeep = (value: unknown, mapKey: (key: string) => string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeysDeep(item, mapKey));
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      next[mapKey(key)] = mapKeysDeep(val, mapKey);
    }
    return next;
  }

  return value;
};

const shouldTransformBody = (value: unknown) =>
  isPlainObject(value) || Array.isArray(value);

const snakecaseQuerySerializerParams = (value: unknown) => {
  if (!isPlainObject(value)) return value;
  if (!isPlainObject(value.parameters)) return value;

  const nextParameters: Record<string, unknown> = {};
  for (const [key, param] of Object.entries(value.parameters)) {
    nextParameters[camelToSnake(key)] = param;
  }

  return { ...value, parameters: nextParameters };
};

export const applyRequestCaseTransforms = <T extends Record<string, unknown>>(options: T): T => {
  const next = { ...options };

  if ("query" in next && isPlainObject(next.query)) {
    next.query = mapKeysDeep(next.query, camelToSnake);
  }

  if ("querySerializer" in next && next.querySerializer) {
    next.querySerializer = snakecaseQuerySerializerParams(next.querySerializer);
  }

  if ("body" in next && shouldTransformBody(next.body)) {
    next.body = mapKeysDeep(next.body, camelToSnake);
  }

  return next;
};

export const applyResponseCaseTransforms = (value: unknown): unknown =>
  mapKeysDeep(value, snakeToCamel);
