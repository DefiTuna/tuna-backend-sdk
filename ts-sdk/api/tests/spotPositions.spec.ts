import { describe, expect, it } from "vitest";

import { getSpotPositions, setTunaBaseUrl, unwrap } from "../src";

import { TEST_WALLET_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All spot positions", async () => {
  const data = await unwrap(getSpotPositions(TEST_WALLET_ADDRESS));

  it("Has zero test positions", () => {
    expect(data.length).toBe(0);
  });
});
