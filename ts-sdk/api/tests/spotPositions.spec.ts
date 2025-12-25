import { beforeAll, describe, expect, it } from "vitest";

import { getSpotPositions, setTunaBaseUrl } from "../src";

import { TEST_WALLET_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All spot positions", async () => {
  const response = await getSpotPositions(TEST_WALLET_ADDRESS);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Has zero test positions", () => {
    expect(data.length).toBe(0);
  });
});
