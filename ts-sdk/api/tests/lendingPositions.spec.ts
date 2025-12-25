import { beforeAll, describe, expect, it } from "vitest";

import { getLendingPosition, getLendingPositions, setTunaBaseUrl } from "../src";

import {
  SOL_LENDING_POSITION,
  SOL_LENDING_VAULT,
  SOL_MINT,
  TEST_WALLET_ADDRESS,
  USDC_LENDING_POSITION,
} from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All lending positions", async () => {
  const response = await getLendingPositions(TEST_WALLET_ADDRESS);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Has two test positions", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data.some(item => item.address === SOL_LENDING_POSITION)).toBe(true);
    expect(data.some(item => item.address === USDC_LENDING_POSITION)).toBe(true);
  });
});

describe("Single lending position", async () => {
  const response = await getLendingPosition(TEST_WALLET_ADDRESS, SOL_LENDING_POSITION);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data.address).toBe(SOL_LENDING_POSITION);
    expect(data.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data.mint).toBe(SOL_MINT);
    expect(data.vault).toBe(SOL_LENDING_VAULT);
  });

  it("Values greater than zero", () => {
    expect(data.shares).toBeGreaterThan(0);
    expect(data.funds.amount).toBeGreaterThan(0);
    expect(data.funds.usd).toBeGreaterThan(0);
    expect(data.earned.amount).toBeGreaterThan(0);
    expect(data.earned.usd).toBeGreaterThan(0);
  });
});
