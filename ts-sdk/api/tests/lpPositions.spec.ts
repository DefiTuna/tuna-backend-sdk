import { beforeAll, describe, expect, it } from "vitest";

import { getTunaPosition, getTunaPositions, setTunaBaseUrl } from "../src";

import {
  LP_POSITION_WITH_LEVERAGE,
  LP_POSITION_WITHOUT_LEVERAGE,
  SOL_MINT,
  SOL_USDC_ORCA_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  USDC_MINT,
} from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All LP positions", async () => {
  const response = await getTunaPositions(TEST_WALLET_ADDRESS);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Has two test positions", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data.some(item => item.address === LP_POSITION_WITHOUT_LEVERAGE)).toBe(true);
    expect(data.some(item => item.address === LP_POSITION_WITH_LEVERAGE)).toBe(true);
  });
});

describe("Single LP position", async () => {
  const response = await getTunaPosition(TEST_WALLET_ADDRESS, LP_POSITION_WITHOUT_LEVERAGE);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data.address).toBe(LP_POSITION_WITHOUT_LEVERAGE);
    expect(data.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data.positionMint).toBe("AP4X27LEaVp9e6xtApjbdjkLRUKNKiciqyvF7VUtkxCJ");
  });

  it("Correct mints", () => {
    expect(data.mintA.mint).toBe(SOL_MINT);
    expect(data.mintA.name).toBe("Wrapped SOL");
    expect(data.mintA.symbol).toBe("SOL");
    expect(data.mintA.decimals).toBe(9);
    expect(data.mintB.mint).toBe(USDC_MINT);
    expect(data.mintB.name).toBe("USD Coin");
    expect(data.mintB.symbol).toBe("USDC");
    expect(data.mintB.decimals).toBe(6);
  });

  it("Correct pool", () => {
    expect(data.pool.addr).toBe(SOL_USDC_ORCA_POOL_ADDRESS);
    expect(data.pool.price).toBeGreaterThan(0);
    expect(data.pool.tickSpacing).toBe(4);
  });

  it("Correct deposit and debt", () => {
    expect(data.depositedCollateralA.amount).toBe(50000000n);
    expect(data.depositedCollateralA.amount).toBeTypeOf("bigint");
    expect(data.depositedCollateralA.usd).toBeGreaterThan(0);
    expect(data.depositedCollateralB.amount).toBe(0n);
    expect(data.depositedCollateralB.amount).toBeTypeOf("bigint");
    expect(data.depositedCollateralB.usd).toBe(0);
    expect(data.initialDebtA.amount).toBe(0n);
    expect(data.initialDebtB.amount).toBe(0n);
    expect(data.currentDebtA.amount).toBe(0n);
    expect(data.currentDebtB.amount).toBe(0n);
    expect(data.leverage).toBe(1);
  });

  it("Correct flags", () => {
    expect(data.flags.lowerLimitOrderSwapToToken).toBeNull();
    expect(data.flags.upperLimitOrderSwapToToken).toBeNull();
    expect(data.flags.autoCompounding).toBeNull();
    expect(data.flags.autoRebalancing).toBe(false);
  });
});
