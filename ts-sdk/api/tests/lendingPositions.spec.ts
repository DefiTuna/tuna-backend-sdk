import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import {
  SOL_LENDING_POSITION,
  SOL_LENDING_VAULT,
  SOL_MINT,
  TEST_WALLET_ADDRESS,
  USDC_LENDING_POSITION,
} from "./consts";
import { sdk } from "./sdk";

describe("All lending positions", async () => {
  const data = await unwrap(
    sdk.getLendingPositions({
      userAddress: TEST_WALLET_ADDRESS,
    }),
  );

  it("Has two test positions", () => {
    expect(data.items.length).toBeGreaterThanOrEqual(2);
    expect(data.items.some(item => item.address === SOL_LENDING_POSITION)).toBe(true);
    expect(data.items.some(item => item.address === USDC_LENDING_POSITION)).toBe(true);
  });
});

describe("Single lending position", async () => {
  const data = await unwrap(
    sdk.getLendingPosition({
      userAddress: TEST_WALLET_ADDRESS,
      lendingPositionAddress: SOL_LENDING_POSITION,
    }),
  );

  it("Poistion found", () => {
    expect(data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data.item?.address).toBe(SOL_LENDING_POSITION);
    expect(data.item?.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data.item?.mint).toBe(SOL_MINT);
    expect(data.item?.vault).toBe(SOL_LENDING_VAULT);
  });

  it("Values greater than zero", () => {
    expect(data.item?.shares).toBeGreaterThan(0);
    expect(data.item?.funds.amount).toBeGreaterThan(0);
    expect(data.item?.funds.usd).toBeGreaterThan(0);
    expect(data.item?.earned.amount).toBeGreaterThan(0);
    expect(data.item?.earned.usd).toBeGreaterThan(0);
  });
});
