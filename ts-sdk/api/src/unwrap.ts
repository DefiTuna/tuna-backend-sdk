export type ApiError = {
  message: string;
  status: number;
};

type HttpLikeResponse = {
  status: number;
  data: unknown;
};

type ExtractSuccessData<R> = R extends { status: 200; data: infer T } ? T : never;

type HasOnlyDataKey<T> = T extends object ? (Exclude<keyof T, "data"> extends never ? true : false) : false;

type UnwrapData<T> = T extends { data: infer U } ? (HasOnlyDataKey<T> extends true ? U : T) : T;

function unwrapData<T>(data: T): UnwrapData<T> {
  if (data && typeof data === "object" && "data" in data && Object.keys(data as object).length === 1) {
    return data.data as UnwrapData<T>;
  }

  return data as UnwrapData<T>;
}

export async function unwrap<R extends HttpLikeResponse>(
  promise: Promise<R>,
): Promise<UnwrapData<ExtractSuccessData<R>>> {
  const res = await promise;

  if (res.status !== 200) {
    throw {
      message: String(res.data),
      status: res.status,
    } satisfies ApiError;
  }

  return unwrapData(res.data as ExtractSuccessData<R>);
}
