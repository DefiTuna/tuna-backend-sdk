import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { TEST_WALLET_ADDRESS } from "./consts";
import { sdk } from "./sdk";

describe("All spot positions", async () => {
  const data = await unwrap(
    sdk.getSpotPositions({
      userAddress: TEST_WALLET_ADDRESS,
    }),
  );

  it("Has zero test positions", () => {
    expect(data.length).toBe(0);
  });
});
