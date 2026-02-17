import { describe, expect, it } from "vitest";

import { LimitOrderStatus, unwrap } from "../src";

import {
  CANCELLED_LIMIT_ORDER,
  COMPLETED_LIMIT_ORDER,
  FILLED_LIMIT_ORDER,
  SOL_MINT,
  SOL_USDC_FUSION_MARKET_ADDRESS,
  SOL_USDC_FUSION_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  TUNA_USDC_FUSION_POOL_ADDRESS,
  USDC_MINT,
} from "./consts";
import { sdk } from "./sdk";

describe("All limit orders", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      userAddress: TEST_WALLET_ADDRESS,
    }),
  );

  it("Has three limit orders", () => {
    expect(data.items.length).toBeGreaterThanOrEqual(3);
    expect(data.items.some(item => item.address === COMPLETED_LIMIT_ORDER)).toBe(true);
    expect(data.items.some(item => item.address === CANCELLED_LIMIT_ORDER)).toBe(true);
    expect(data.items.some(item => item.address === FILLED_LIMIT_ORDER)).toBe(true);
  });
});

describe("Limit orders filter by pool", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      userAddress: TEST_WALLET_ADDRESS,
      pool: [SOL_USDC_FUSION_POOL_ADDRESS],
    }),
  );

  it("Can filter by pool", () => {
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every(item => data.markets[item.market]?.pool.address === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(
      true,
    );
  });
});

describe("Limit orders filter by two pools", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      userAddress: TEST_WALLET_ADDRESS,
      pool: [SOL_USDC_FUSION_POOL_ADDRESS, TUNA_USDC_FUSION_POOL_ADDRESS],
    }),
  );

  it("Can filter by two pools", () => {
    const pools = new Set(data.items.map(item => data.markets[item.market]?.pool.address));
    expect(data.items.length).toBeGreaterThan(0);
    expect(pools.has(SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
    expect(pools.has(TUNA_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Limit orders filter by status", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      userAddress: TEST_WALLET_ADDRESS,
      status: [LimitOrderStatus.COMPLETE],
    }),
  );

  it("Can filter by status", () => {
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every(item => item.state === LimitOrderStatus.COMPLETE)).toBe(true);
  });
});

describe("Limit orders filter by time", async () => {
  // 2025-10-09 - 2025-10-10
  const data = await unwrap(
    sdk.getLimitOrders({
      userAddress: TEST_WALLET_ADDRESS,
      openedAtFrom: 1759968000000,
      openedAtTo: 1760054400000,
    }),
  );

  it("Can filter by time", () => {
    expect(data.items.length).toBeGreaterThan(0);
    expect(
      data.items.every(item => item.openedAt > new Date("2025-10-09") && item.openedAt < new Date("2025-10-10")),
    ).toBe(true);
  });
});

describe("Single limit order", async () => {
  const data = await unwrap(
    sdk.getLimitOrder({
      userAddress: TEST_WALLET_ADDRESS,
      limitOrderAddress: COMPLETED_LIMIT_ORDER,
    }),
  );

  const item = data?.item;
  const market = item ? data?.markets[item.market] : undefined;
  const mintA = market ? data?.mints[market.pool.mintA] : undefined;
  const mintB = market ? data?.mints[market.pool.mintB] : undefined;

  it("Order found", () => {
    expect(item).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(item?.address).toBe(COMPLETED_LIMIT_ORDER);
    expect(item?.authority).toBe(TEST_WALLET_ADDRESS);
    expect(item?.orderMint).toBe("B9wtuHYXi9PEjnBx8snb9JqJJTRh9jyGELpfSjuSugCH");
    expect(item?.openTxSignature).toBe(
      "57kb2nBY4sHnkgZbJEByc7F6rd2SUhCJRXEqS6Bg5aJhBuUHuNibJUahExx24x64jY3xgCjrv3wna1RQoKyZdG4d",
    );
    expect(item?.closeTxSignature).toBe(
      "65c7RKe7HHuidCofPjHsy4iXFvXCLCzqMLvJ6HEq83S8BZBPxJXoPCakjqvN86jHGNk1AoDZmY7LWHo5W2txSzA6",
    );
    expect(item?.market).toBe(SOL_USDC_FUSION_MARKET_ADDRESS);
    expect(market?.pool.address).toBe(SOL_USDC_FUSION_POOL_ADDRESS);
    expect(mintA?.address).toBe(SOL_MINT);
    expect(mintB?.address).toBe(USDC_MINT);
  });

  it("Correct values", () => {
    expect(item?.state).toBe(LimitOrderStatus.COMPLETE);
    expect(item?.fillRatio).toBe(1);
    expect(item?.aToB).toBe(true);
    expect(item?.tickIndex).toBe(-14936);
    expect(item?.amountIn.amount).toBe(445188n);
    expect(item?.amountIn.amount).toBeTypeOf("bigint");
    expect(item?.amountOut.amount).toBe(100017n);
    expect(item?.amountOut.amount).toBeTypeOf("bigint");
    expect(item?.openedAt).toEqual(new Date("2025-10-09T12:23:59Z"));
    expect(item?.openedAt).toBeTypeOf("object");
    expect(item?.closedAt).toEqual(new Date("2025-10-13T01:54:36Z"));
    expect(item?.closedAt).toBeTypeOf("object");
  });
});
