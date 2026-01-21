import { describe, expect, it } from "vitest";

import { LimitOrderStatus, unwrap } from "../src";

import {
  CANCELLED_LIMIT_ORDER,
  COMPLETED_LIMIT_ORDER,
  FILLED_LIMIT_ORDER,
  SOL_MINT,
  SOL_USDC_FUSION_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  TUNA_USDC_FUSION_POOL_ADDRESS,
  USDC_MINT,
} from "./consts";
import { sdk } from "./sdk";

describe("All limit orders", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
      },
    }),
  );

  it("Has three limit orders", () => {
    expect(data.length).toBeGreaterThanOrEqual(3);
    expect(data.some(item => item.address === COMPLETED_LIMIT_ORDER)).toBe(true);
    expect(data.some(item => item.address === CANCELLED_LIMIT_ORDER)).toBe(true);
    expect(data.some(item => item.address === FILLED_LIMIT_ORDER)).toBe(true);
  });
});

describe("Limit orders filter by pool", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
      },
      query: {
        pool: [SOL_USDC_FUSION_POOL_ADDRESS],
      },
    }),
  );
  it("Can filter by pool", () => {
    expect(data.length).toBeGreaterThan(0);
    expect(data.every(item => item.pool.address === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Limit orders filter by two pools", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
      },
      query: {
        pool: [SOL_USDC_FUSION_POOL_ADDRESS, TUNA_USDC_FUSION_POOL_ADDRESS],
      },
    }),
  );
  it("Can filter by two pools", () => {
    expect(data.length).toBeGreaterThan(0);
    expect(data.some(item => item.pool.address === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
    expect(data.some(item => item.pool.address === TUNA_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Limit orders filter by status", async () => {
  const data = await unwrap(
    sdk.getLimitOrders({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
      },
      query: {
        status: [LimitOrderStatus.COMPLETE],
      },
    }),
  );
  it("Can filter by status", () => {
    expect(data.length).toBeGreaterThan(0);
    expect(data.every(item => item.state === LimitOrderStatus.COMPLETE)).toBe(true);
  });
});

describe("Limit orders filter by time", async () => {
  // 2025-10-09 - 2025-10-10
  const data = await unwrap(
    sdk.getLimitOrders({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
      },
      query: {
        openedAtFrom: 1759968000000,
        openedAtTo: 1760054400000,
      },
    }),
  );
  it("Can filter by time", () => {
    expect(data.length).toBeGreaterThan(0);
    expect(data.every(item => item.openedAt > new Date("2025-10-09") && item.openedAt < new Date("2025-10-10"))).toBe(
      true,
    );
  });
});

describe("Single limit order", async () => {
  const data = await unwrap(
    sdk.getLimitOrder({
      path: {
        userAddress: TEST_WALLET_ADDRESS,
        limitOrderAddress: COMPLETED_LIMIT_ORDER,
      },
    }),
  );

  it("Order found", () => {
    expect(data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data?.address).toBe(COMPLETED_LIMIT_ORDER);
    expect(data?.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data?.orderMint).toBe("B9wtuHYXi9PEjnBx8snb9JqJJTRh9jyGELpfSjuSugCH");
    expect(data?.openTxSignature).toBe(
      "57kb2nBY4sHnkgZbJEByc7F6rd2SUhCJRXEqS6Bg5aJhBuUHuNibJUahExx24x64jY3xgCjrv3wna1RQoKyZdG4d",
    );
    expect(data?.closeTxSignature).toBe(
      "65c7RKe7HHuidCofPjHsy4iXFvXCLCzqMLvJ6HEq83S8BZBPxJXoPCakjqvN86jHGNk1AoDZmY7LWHo5W2txSzA6",
    );
    expect(data?.pool.address).toBe(SOL_USDC_FUSION_POOL_ADDRESS);
    expect(data?.pool.mintA.address).toBe(SOL_MINT);
    expect(data?.pool.mintB.address).toBe(USDC_MINT);
  });

  it("Correct values", () => {
    expect(data?.state).toBe(LimitOrderStatus.COMPLETE);
    expect(data?.fillRatio).toBe(1);
    expect(data?.aToB).toBe(true);
    expect(data?.tickIndex).toBe(-14936);
    expect(data?.amountIn.amount).toBe(445188n);
    expect(data?.amountIn.amount).toBeTypeOf("bigint");
    expect(data?.amountOut.amount).toBe(100017n);
    expect(data?.amountOut.amount).toBeTypeOf("bigint");
    expect(data?.openedAt).toEqual(new Date("2025-10-09T12:23:59Z"));
    expect(data?.openedAt).toBeTypeOf("object");
    expect(data?.closedAt).toEqual(new Date("2025-10-13T01:54:36Z"));
    expect(data?.closedAt).toBeTypeOf("object");
  });
});
