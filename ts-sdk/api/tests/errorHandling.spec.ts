import { describe, expect, it } from "vitest";

import type { GetMarketError } from "../src";
import { createClient, isTunaSdkError, TunaBackendSdk, TunaBackendSdkError, tunaSdkErrorInterceptor } from "../src";

const createThrowingSdk = () => {
  const client = createClient({
    baseUrl: process.env.API_BASE_URL!,
    responseStyle: "data",
    throwOnError: true,
  });

  client.interceptors.error.use(tunaSdkErrorInterceptor);

  return new TunaBackendSdk({ client });
};

describe("SDK error handling", async () => {
  it("Returns data-only responses when responseStyle is data", async () => {
    const sdk = createThrowingSdk();
    const data = await sdk.getVaults();
    expect(data).toHaveProperty("data");
    expect("response" in data).toBe(false);
  });

  it("Throws TunaSdkError with status and cause", async () => {
    const sdk = createThrowingSdk();
    try {
      await sdk.getVault({
        vaultAddress: "123",
      });
      expect.fail("Expected error to be thrown");
    } catch (error) {
      expect(isTunaSdkError(error)).toBe(true);
      const err = error as TunaBackendSdkError;
      expect(err.status).toBe(400);
      expect(err.cause).toBeDefined();
      expect(typeof err.cause).toBe("object");
      // const cause = err.cause as { code?: unknown };
      // expect(typeof cause.code).toBe("string");
    }
  });

  it("Preserves API error payload in TunaSdkError cause", async () => {
    const sdk = createThrowingSdk();
    try {
      await sdk.getVault({
        vaultAddress: "123",
      });
      expect.fail("Expected API error to be thrown");
    } catch (error) {
      expect(isTunaSdkError(error)).toBe(true);
      const err = error as TunaBackendSdkError;
      expect(err.status).toBe(400);
      expect(err.cause).toBeDefined();
    }
  });

  it("Wraps abort errors in TunaSdkError cause", async () => {
    const sdk = createThrowingSdk();
    const controller = new AbortController();
    controller.abort();

    try {
      await sdk.getVaults({ signal: controller.signal });
      expect.fail("Expected abort to throw");
    } catch (error) {
      expect(isTunaSdkError(error)).toBe(true);
      const err = error as TunaBackendSdkError;
      expect(err.cause).toBeInstanceOf(DOMException);
      const cause = err.cause as DOMException;
      expect(cause.name).toBe("AbortError");
    }
  });

  it("Supports typed TunaSdkError casts from README example", async () => {
    const sdk = createThrowingSdk();

    try {
      await sdk.getMarket({
        marketAddress: "123",
      });
      expect.fail("Expected API error to be thrown");
    } catch (error) {
      expect(isTunaSdkError(error)).toBe(true);
      const err = error as TunaBackendSdkError<GetMarketError>;
      expect(typeof err.status).toBe("number");
      expect(err.cause).toBeDefined();
      expect(typeof err.cause).toBe("object");
      // const cause = err.cause as { code?: unknown };
      // expect(typeof cause.code).toBe("string");
    }
  });
});
