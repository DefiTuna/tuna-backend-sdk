import { describe, expect, it } from "vitest";

import {
  getUserStakingPosition,
  getUserStakingPositionHistory,
  setTunaBaseUrl,
  StakingPositionActionType,
  unwrap,
} from "../src";

import { TEST_WALLET_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("Staking position", async () => {
  const data = await unwrap(getUserStakingPosition(TEST_WALLET_ADDRESS));

  it("Correct addresses", () => {
    expect(data.owner).toBe(TEST_WALLET_ADDRESS);
    expect(data.address).toBe("85nfr3udqu82EumQZh7bE5XKybH17qKQc7JEMyH9KEr4");
  });

  it("Correct staked amount", () => {
    expect(data.staked.amount).toBe(10000000n);
    expect(data.staked.usd).toBeGreaterThan(0);
  });

  it("Some unclaimed reward amount", () => {
    expect(data.unclaimedReward.amount).toBeGreaterThan(0n);
    expect(data.unclaimedReward.usd).toBeGreaterThan(0);
  });

  it("No claimed reward amount", () => {
    expect(data.claimedReward.amount).toBe(0n);
    expect(data.claimedReward.usd).toBe(0);
  });

  it("No vesting", () => {
    expect(data.vesting.locked.amount).toBe(0n);
    expect(data.vesting.unlocked.amount).toBe(0n);
  });
});

describe("Staking position history", async () => {
  const data = await unwrap(getUserStakingPositionHistory(TEST_WALLET_ADDRESS));

  it("Has one history record", () => {
    expect(data.length).toBe(1);
  });

  it("Correct data", () => {
    expect(data[0].position).toBe("85nfr3udqu82EumQZh7bE5XKybH17qKQc7JEMyH9KEr4");
    expect(data[0].action).toBe(StakingPositionActionType.stake);
    expect(data[0].amount).toBe(10000000n);
    expect(data[0].time).toEqual(new Date("2025-08-21T23:03:11Z"));
    expect(data[0].txSignature).toBe(
      "54EiRVvubHL7pCoDute7Eg5bFmD3BffpMZB9RhecJgs2QbsEMahVzmMoNh2KSHHtabJrJZY8UVUXYxPXJ3kwpdiN",
    );
  });
});
