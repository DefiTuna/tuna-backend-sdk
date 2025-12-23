import { describe, expect, it } from "vitest";

import { getPool, getPoolSwaps, getPoolTicks, setTunaBaseUrl, unwrap } from "../src";

import { SOL_USDC_FUSION_POOL_ADDRESS, SOL_USDC_ORCA_POOL_ADDRESS } from "./consts";
import { getMarketsFromRpc } from "./rpc";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("Single Pool", async () => {
  const rpcMarkets = await getMarketsFromRpc();
  // Prefer SOL/USDC pool
  const marketDst = rpcMarkets.find(market => market.data.pool === SOL_USDC_FUSION_POOL_ADDRESS) ?? rpcMarkets[0];

  const samplePoolAddress = marketDst.data.pool;
  const unsavedPoolAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const pool = await unwrap(getPool(samplePoolAddress));

  it("Returns pool data", () => {
    expect(pool.address).toBe(samplePoolAddress);
    expect(pool.feeRate).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved pool", async () => {
    const response = await getPool(unsavedPoolAddress);
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid pool", async () => {
    const response = await getPool("123");
    expect(response.status).toBe(400);
  });
});

describe("Pool Ticks", async () => {
  const poolTicks = await unwrap(getPoolTicks("FwewVm8u6tFPGewAyHmWAqad9hmF7mvqxK4mJ7iNqqGC"));

  it("Have tick spacing", () => {
    expect(poolTicks.tickSpacing > 0).toBe(true);
  });
  it("Have non-empty middle tick", () => {
    expect(poolTicks.ticks[Math.round(poolTicks.ticks.length / 2)].liquidity).not.toBe(0n);
  });
});

describe("Pool swaps", async () => {
  const nowTimestampSeconds = Date.now() / 1000;
  const poolSwaps = await unwrap(getPoolSwaps(SOL_USDC_ORCA_POOL_ADDRESS));

  it("Returns correct data", () => {
    expect(poolSwaps.length).toBeGreaterThan(0);
    const sampleSwap = poolSwaps[0];
    expect(sampleSwap.amountIn).toBeGreaterThan(0n);
    expect(sampleSwap.amountOut).toBeGreaterThan(0n);
    const swapTimestampSeconds = sampleSwap.time.getTime() / 1000;
    expect(swapTimestampSeconds).closeTo(nowTimestampSeconds, 60);
  });
});
