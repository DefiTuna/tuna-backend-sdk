import { describe, expect, it } from "vitest";

import { createClient, TunaBackendSdk, TunaSdkError, tunaSdkErrorInterceptor } from "../src";

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
        path: {
          vaultAddress: "123",
        },
      });
      expect.fail("Expected error to be thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TunaSdkError);
      const err = error as TunaSdkError;
      expect(err.status).toBe(400);
      expect(err.cause).toBeDefined();
    }
  });
});
