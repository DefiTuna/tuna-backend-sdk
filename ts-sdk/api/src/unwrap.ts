export type ApiError = {
  status: number;
};

type HttpResponse<T, E = unknown> = { status: number; data: T } | { status: number; data: E | void };

type HasOnlyDataKey<T> = T extends object ? (Exclude<keyof T, "data"> extends never ? true : false) : false;

type UnwrapData<T> = T extends { data: infer U } ? (HasOnlyDataKey<T> extends true ? U : T) : T;

function unwrapData<T>(data: T): UnwrapData<T> {
  if (data && typeof data === "object" && "data" in data && Object.keys(data as object).length === 1) {
    return data.data as UnwrapData<T>;
  }

  return data as UnwrapData<T>;
}

export async function unwrap<T, E = unknown>(promise: Promise<HttpResponse<T, E>>): Promise<UnwrapData<T>> {
  const res = await promise;

  if (res.status != 200) {
    throw {
      status: res.status,
    } satisfies ApiError;
  }

  return unwrapData(res.data as T);
}
