import { describe, expect, it } from "vitest";

import {
  getStakingLeaderboard,
  getStakingRevenueStats,
  getStakingTreasury,
  getUserStakingPosition,
  getUserStakingPositionHistory,
  setTunaBaseUrl,
  unwrap,
} from "../src";

import { TEST_WALLET_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("Staking", async () => {
  const treasury = await unwrap(getStakingTreasury());
  const position = await unwrap(getUserStakingPosition(TEST_WALLET_ADDRESS));
  const history = await unwrap(getUserStakingPositionHistory(TEST_WALLET_ADDRESS));

  it("Returns treasury", () => {
    expect(treasury.totalStaked.amount).toBeGreaterThan(0n);
    expect(treasury.uniqueStakers).toBeGreaterThan(1000n);
  });
  it("Returns position", () => {
    expect(position.address).toBeTruthy();
    expect(position.rank).toBeTruthy();
  });
  it("Returns history", () => {
    expect(history.length).toBe(1);
  });
});

describe("Staking leaderboard", async () => {
  const firstPage = await unwrap(getStakingLeaderboard({ page: 1, pageSize: 10 }));
  const secondPage = await unwrap(getStakingLeaderboard({ page: 2, pageSize: 20 }));
  const searchPage = await unwrap(getStakingLeaderboard({ page: 1, pageSize: 20, search: "c31" }));

  it("Returns leaderboard", () => {
    expect(firstPage.data.length).toBeGreaterThan(0n);
    expect(firstPage.data.length).toBeGreaterThan(0n);
  });
  it("Returns ranks", () => {
    expect(firstPage.data[0].rank).toBe(1);
    expect(secondPage.data[0].rank).toBe(21);
  });
  it("Returns total", () => {
    expect(firstPage.meta.total).toBeGreaterThan(0n);
    expect(secondPage.meta.total).toBeGreaterThan(0n);
  });
  it("Searches", () => {
    expect(searchPage.meta.total).toBeGreaterThan(0n);
  });
});

describe("Staking Revenue", async () => {
  const stats = await unwrap(
    getStakingRevenueStats({
      from: new Date("2025-01-01").toISOString().slice(0, 10),
      to: new Date("2025-07-30").toISOString().slice(0, 10),
    }),
  );

  it("Returns revenue stats", () => {
    expect(stats.length).toBeGreaterThan(0);
  });
});
