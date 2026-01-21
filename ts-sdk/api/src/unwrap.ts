import { TunaSdkError } from "./error";

type SdkSuccess<TData = unknown> = {
  data: TData;
  error?: undefined;
  request: Request;
  response: Response;
};

type SdkError<TError = unknown> = {
  data?: undefined;
  error: TError;
  request: Request;
  response: Response;
};

type SdkResponse<TData = unknown, TError = unknown> = SdkSuccess<TData> | SdkError<TError>;

type HasOnlyDataKey<T> = T extends object ? (Exclude<keyof T, "data"> extends never ? true : false) : false;

type UnwrapData<T> = T extends { data: infer U } ? (HasOnlyDataKey<T> extends true ? U : T) : T;

type ExtractData<T> = T extends { data: infer D; error?: undefined }
  ? D
  : T extends { data?: undefined; error: unknown }
    ? never
    : T;
type UnwrapReturn<T> = UnwrapData<NonNullable<ExtractData<T>>>;

function unwrapData<T>(data: T): UnwrapData<T> {
  if (data && typeof data === "object" && "data" in data && Object.keys(data as object).length === 1) {
    return data.data as UnwrapData<T>;
  }

  return data as UnwrapData<T>;
}

export async function unwrap<T>(promise: Promise<T>): Promise<UnwrapReturn<T>> {
  const res = await promise;

  if (res && typeof res === "object" && "response" in res) {
    const sdkRes = res as SdkResponse;

    if ("error" in sdkRes && sdkRes.error !== undefined) {
      throw new TunaSdkError(String(sdkRes.error), sdkRes.response?.status ?? 0, sdkRes.error);
    }

    if ("data" in sdkRes) {
      return unwrapData(sdkRes.data) as UnwrapReturn<T>;
    }
  }

  return unwrapData(res) as UnwrapReturn<T>;
}
