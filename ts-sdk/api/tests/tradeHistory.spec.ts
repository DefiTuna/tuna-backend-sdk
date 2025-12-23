import { beforeAll, describe, expect, it } from "vitest";

import {
  getTradeHistory,
  OrderHistoryUIDirection,
  setTunaBaseUrl,
  TradeHistoryAction,
  TradeHistoryUIDirection,
} from "../src";

import {
  COMPLETED_LIMIT_ORDER,
  FILLED_LIMIT_ORDER,
  SOL_USDC_FUSION_POOL_ADDRESS,
  TEST_WALLET_ADDRESS,
  TUNA_USDC_FUSION_POOL_ADDRESS,
} from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("All trade history events", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS);
  const data = response.data!.data!;

  beforeAll(() => {
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.data).toBeDefined();
  });

  it("Has three orders", () => {
    expect(data.length).toBeGreaterThanOrEqual(3);
    expect(data.some(item => item.positionAddress === COMPLETED_LIMIT_ORDER)).toBe(true);
    // This position returned with null address
    //expect(data.some(item => item.positionAddress === CANCELLED_LIMIT_ORDER)).toBe(true);
    expect(data.some(item => item.positionAddress === FILLED_LIMIT_ORDER)).toBe(true);
  });
});

describe("Trade history filter by pool", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS, {
    pool: [SOL_USDC_FUSION_POOL_ADDRESS],
  });
  it("Can filter by pool", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.pool === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Trade history filter by two pools", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS, {
    pool: [SOL_USDC_FUSION_POOL_ADDRESS, TUNA_USDC_FUSION_POOL_ADDRESS],
  });
  it("Can filter by two pools", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.some(item => item.pool === SOL_USDC_FUSION_POOL_ADDRESS)).toBe(true);
    expect(response.data?.data.some(item => item.pool === TUNA_USDC_FUSION_POOL_ADDRESS)).toBe(true);
  });
});

describe("Trade history filter by action type", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS, { action: [TradeHistoryAction.limitOrderFill] });
  it("Can filter by action type", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.action === TradeHistoryAction.limitOrderFill)).toBe(true);
  });
});

describe("Trade history filter by ui direction", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS, { uiDirection: [TradeHistoryUIDirection.buy] });
  it("Can filter by ui direction", () => {
    expect(response.status).toBe(200);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every(item => item.uiDirection === TradeHistoryUIDirection.buy)).toBe(true);
  });
});

describe("Single trade history item", async () => {
  const response = await getTradeHistory(TEST_WALLET_ADDRESS);
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
    expect(data.action).toBe(TradeHistoryAction.limitOrderFill);
    expect(data.aToB).toBe(true);
    expect(data.uiDirection).toBe(OrderHistoryUIDirection.sell);
  });

  it("Correct amounts", () => {
    expect(data.baseToken.amount).toBe(445188n);
    expect(data.quoteToken.amount).toBe(100017n);
    expect(data.fee.amount).toBe(-37);
  });
});
