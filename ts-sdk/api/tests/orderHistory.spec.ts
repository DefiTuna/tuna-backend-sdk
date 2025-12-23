import { beforeAll, describe, expect, it } from "vitest";

import { getOrderHistory, OrderHistoryStatus, OrderHistoryType, OrderHistoryUIDirection, setTunaBaseUrl } from "../src";

import {
  CANCELLED_LIMIT_ORDER,
  COMPLETED_LIMIT_ORDER,
  FILLED_LIMIT_ORDER,
  SOL_USDC_FUSION_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  TUNA_USDC_FUSION_POOL_ADDRESS,
} from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All order history", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Has three orders", () => {
    expect(data.length).toBeGreaterThanOrEqual(3);
    expect(data.some(item => item.positionAddress === COMPLETED_LIMIT_ORDER)).toBe(true);
    expect(data.some(item => item.positionAddress === CANCELLED_LIMIT_ORDER)).toBe(true);
    expect(data.some(item => item.positionAddress === FILLED_LIMIT_ORDER)).toBe(true);
  });
});

describe("Order history filter by pool", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS, {
    pool: [SOL_USDC_FUSION_POOL_ADDRESS],
  });
  it("Can filter by pool", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.pool === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Order history filter by two pools", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS, {
    pool: [SOL_USDC_FUSION_POOL_ADDRESS, TUNA_USDC_FUSION_POOL_ADDRESS],
  });
  it("Can filter by two pools", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.some(item => item.pool === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
    expect(response.data?.data.some(item => item.pool === TUNA_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Order history filter by order type", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS, { orderType: [OrderHistoryType.limit] });
  it("Can filter by order type", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.orderType === OrderHistoryType.limit)).toBe(true);
  });
});

describe("Order history filter by ui direction", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS, { uiDirection: [OrderHistoryUIDirection.buy] });
  it("Can filter by ui direction", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.uiDirection === OrderHistoryUIDirection.buy)).toBe(true);
  });
});

describe("Single order history item", async () => {
  const response = await getOrderHistory(TEST_WALLET_ADDRESS);
  const data = response.data!.data!.filter(item => item.positionAddress === COMPLETED_LIMIT_ORDER)[0] || undefined;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
    expect(data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data.positionAddress).toBe(COMPLETED_LIMIT_ORDER);
    expect(data.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data.pool).toBe(SOL_USDC_FUSION_POOL_ADDRESS);
  });

  it("Correct parameters", () => {
    expect(data.orderType).toBe(OrderHistoryType.limit);
    expect(data.isReduceOnly).toBe(false);
    expect(data.aToB).toBe(true);
    expect(data.uiDirection).toBe(OrderHistoryUIDirection.sell);
    expect(data.status).toBe(OrderHistoryStatus.claimed);
  });

  it("Correct amounts", () => {
    expect(data.baseToken.amount).toBe(445188n);
    expect(data.baseTokenConsumedAmount?.amount).toBe(445188n);
    expect(data.quoteToken.amount).toBe(100017n);
    expect(data.quoteTokenFilledAmount?.amount).toBe(100011n);
  });
});
