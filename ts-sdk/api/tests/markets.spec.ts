import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { SOL_USDC_FUSION_POOL_ADDRESS } from "./consts";
import { getMarketsFromRpc } from "./rpc";
import { sdk } from "./sdk";

describe("Markets", async () => {
  const rpcMarkets = await getMarketsFromRpc();
  const markets = await unwrap(sdk.getMarkets());

  it("Length matches rpc", () => {
    expect(markets.length).toBe(rpcMarkets.length);
  });
  it("Match RPC markets addresses", () => {
    expect(rpcMarkets.map(rpcMarket => rpcMarket.address).sort()).toEqual(markets.map(market => market.address).sort());
  });
  it("Match RPC markets pool addresses", () => {
    expect(rpcMarkets.map(rpcMarket => rpcMarket.data.pool).sort()).toEqual(
      markets.map(market => market.pool.address).sort(),
    );
  });
});

describe("Single Market", async () => {
  const rpcMarkets = await getMarketsFromRpc();
  // Prefer SOL/USDC pool
  const marketDst = rpcMarkets.find(market => market.data.pool === SOL_USDC_FUSION_POOL_ADDRESS) ?? rpcMarkets[0];
  const sampleMarketAddress = marketDst.address;
  const unsavedMarketAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const market = await unwrap(
    sdk.getMarket({
      marketAddress: sampleMarketAddress,
    }),
  );

  it("Returns market data", () => {
    expect(market.address).toBe(sampleMarketAddress);
    expect(market.pool.feeRate).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved market", async () => {
    const { response } = await sdk.getMarket({
      marketAddress: unsavedMarketAddress,
    });
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid market", async () => {
    const { response } = await sdk.getMarket({
      marketAddress: "123",
    });
    expect(response.status).toBe(400);
  });
});
