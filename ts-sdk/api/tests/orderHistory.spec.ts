import { describe, expect, it } from "vitest";

import { OrderHistoryStatus, OrderHistoryType, OrderHistoryUiDirection, unwrap } from "../src";

import {
  CANCELLED_LIMIT_ORDER,
  COMPLETED_LIMIT_ORDER,
  FILLED_LIMIT_ORDER,
  SOL_USDC_FUSION_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  TUNA_USDC_FUSION_POOL_ADDRESS,
} from "./consts";
import { sdk } from "./sdk";

describe("All order history", async () => {
  const data = await unwrap(
    sdk.getOrderHistory({
      userAddress: TEST_WALLET_ADDRESS,
    }),
  );

  it("Has three orders", () => {
    expect(data.items.length).toBeGreaterThanOrEqual(3);
    expect(data.items.some(item => item.positionAddress === COMPLETED_LIMIT_ORDER)).toBe(true);
    expect(data.items.some(item => item.positionAddress === CANCELLED_LIMIT_ORDER)).toBe(true);
    expect(data.items.some(item => item.positionAddress === FILLED_LIMIT_ORDER)).toBe(true);
  });
});

describe("Order history filter by pool", async () => {
  const data = await unwrap(
    sdk.getOrderHistory({
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

describe("Order history filter by two pools", async () => {
  const data = await unwrap(
    sdk.getOrderHistory({
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

describe("Order history filter by order type", async () => {
  const data = await unwrap(
    sdk.getOrderHistory({
      userAddress: TEST_WALLET_ADDRESS,
      orderType: [OrderHistoryType.LIMIT],
    }),
  );

  it("Can filter by order type", () => {
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every(item => item.orderType === OrderHistoryType.LIMIT)).toBe(true);
  });
});

describe("Order history filter by ui direction", async () => {
  const data = await unwrap(
    sdk.getOrderHistory({
      userAddress: TEST_WALLET_ADDRESS,
      uiDirection: [OrderHistoryUiDirection.BUY],
    }),
  );

  it("Can filter by ui direction", () => {
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every(item => item.uiDirection === OrderHistoryUiDirection.BUY)).toBe(true);
  });
});

describe("Single order history item", async () => {
  const allData = await unwrap(
    sdk.getOrderHistory({
      userAddress: TEST_WALLET_ADDRESS,
    }),
  );
  const data = allData.items.find(item => item.positionAddress === COMPLETED_LIMIT_ORDER);

  it("Order history item found", () => {
    expect(data).toBeDefined();
  });

  it("Correct addresses", () => {
    const market = data ? allData.markets[data.market] : undefined;
    expect(data?.positionAddress).toBe(COMPLETED_LIMIT_ORDER);
    expect(data?.authority).toBe(TEST_WALLET_ADDRESS);
    expect(market?.pool.address).toBe(SOL_USDC_FUSION_POOL_ADDRESS);
  });

  it("Correct parameters", () => {
    expect(data?.orderType).toBe(OrderHistoryType.LIMIT);
    expect(data?.isReduceOnly).toBe(false);
    expect(data?.aToB).toBe(true);
    expect(data?.uiDirection).toBe(OrderHistoryUiDirection.SELL);
    expect(data?.status).toBe(OrderHistoryStatus.CLAIMED);
  });

  it("Correct amounts", () => {
    expect(data?.baseToken.amount).toBe(445188n);
    expect(data?.baseTokenConsumedAmount?.amount).toBe(445188n);
    expect(data?.quoteToken.amount).toBe(100017n);
    expect(data?.quoteTokenFilledAmount?.amount).toBe(100011n);
  });
});
