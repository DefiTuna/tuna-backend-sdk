import { describe, expect, it } from "vitest";

import {
  getLpPositionActions,
  getLpPositions,
  getTunaPosition,
  getTunaPositions,
  setTunaBaseUrl,
  TunaLpPositionAutoCompound,
  TunaLpPositionLimitOrderSwap,
  TunaLpPositionsActionType,
  TunaPositionDtoState,
  unwrap,
} from "../src";

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
  const data = await unwrap(getTunaPositions(TEST_WALLET_ADDRESS));

  it("Has two test positions", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data.some(item => item.address === LP_POSITION_WITHOUT_LEVERAGE)).toBe(true);
    expect(data.some(item => item.address === LP_POSITION_WITH_LEVERAGE)).toBe(true);
  });
});

describe("Single LP position", async () => {
  const data = await unwrap(getTunaPosition(TEST_WALLET_ADDRESS, LP_POSITION_WITHOUT_LEVERAGE));

  it("Poistion found", () => {
    expect(data).toBeDefined();
  });

  it("Correct addresses", () => {
    expect(data?.address).toBe(LP_POSITION_WITHOUT_LEVERAGE);
    expect(data?.authority).toBe(TEST_WALLET_ADDRESS);
    expect(data?.positionMint).toBe("AP4X27LEaVp9e6xtApjbdjkLRUKNKiciqyvF7VUtkxCJ");
  });

  it("Correct mints", () => {
    expect(data?.pool.mintA.address).toBe(SOL_MINT);
    expect(data?.pool.mintA.name).toBe("Wrapped SOL");
    expect(data?.pool.mintA.symbol).toBe("SOL");
    expect(data?.pool.mintA.decimals).toBe(9);
    expect(data?.pool.mintB.address).toBe(USDC_MINT);
    expect(data?.pool.mintB.name).toBe("USD Coin");
    expect(data?.pool.mintB.symbol).toBe("USDC");
    expect(data?.pool.mintB.decimals).toBe(6);
  });

  it("Correct pool", () => {
    expect(data?.pool.address).toBe(SOL_USDC_ORCA_POOL_ADDRESS);
    expect(data?.pool.price).toBeGreaterThan(0);
    expect(data?.pool.tickSpacing).toBe(4);
  });

  it("Correct deposit and debt", () => {
    expect(data?.depositedCollateralA.amount).toBe(50000000n);
    expect(data?.depositedCollateralA.amount).toBeTypeOf("bigint");
    expect(data?.depositedCollateralA.usd).toBeGreaterThan(0);
    expect(data?.depositedCollateralB.amount).toBe(0n);
    expect(data?.depositedCollateralB.amount).toBeTypeOf("bigint");
    expect(data?.depositedCollateralB.usd).toBe(0);
    expect(data?.initialDebtA.amount).toBe(0n);
    expect(data?.initialDebtB.amount).toBe(0n);
    expect(data?.currentDebtA.amount).toBe(0n);
    expect(data?.currentDebtB.amount).toBe(0n);
    expect(data?.leverage).toBe(1);
  });

  it("Correct flags", () => {
    expect(data?.flags.lowerLimitOrderSwapToToken).toBeNull();
    expect(data?.flags.upperLimitOrderSwapToToken).toBeNull();
    expect(data?.flags.autoCompounding).toBeNull();
    expect(data?.flags.autoRebalancing).toBe(false);
  });
});

describe("All historical LP positions", async () => {
  const data = await unwrap(getLpPositions(TEST_WALLET_ADDRESS));

  it("Has two test positions", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data.some(item => item.positionAddress === LP_POSITION_WITHOUT_LEVERAGE)).toBe(true);
    expect(data.some(item => item.positionAddress === LP_POSITION_WITH_LEVERAGE)).toBe(true);
  });
});

describe("Historical LP positions by open state", async () => {
  const data = await unwrap(
    getLpPositions(TEST_WALLET_ADDRESS, {
      state: [TunaPositionDtoState.open],
    }),
  );
  it("Can filter by state", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Historical LP positions by non-existing states", async () => {
  const data = await unwrap(
    getLpPositions(TEST_WALLET_ADDRESS, {
      state: [TunaPositionDtoState.liquidated, TunaPositionDtoState.closedByLimitOrder],
    }),
  );
  it("Can filter by state", () => {
    expect(data.length).toBe(0);
  });
});

describe("Historical LP positions by pool", async () => {
  const data = await unwrap(
    getLpPositions(TEST_WALLET_ADDRESS, {
      liquidityPool: [SOL_USDC_ORCA_POOL_ADDRESS],
    }),
  );
  it("Can filter by pool", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("List LP positions actions", async () => {
  const data = await unwrap(getLpPositionActions(TEST_WALLET_ADDRESS, LP_POSITION_WITHOUT_LEVERAGE));

  it("Has at least open and increase liquidity actions", () => {
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data.slice(-2)[1].action).toBe(TunaLpPositionsActionType.openPosition);
    expect(data.slice(-2)[0].action).toBe(TunaLpPositionsActionType.increaseLiquidity);
  });
});

describe("Open position action", async () => {
  const allData = await unwrap(getLpPositionActions(TEST_WALLET_ADDRESS, LP_POSITION_WITH_LEVERAGE));

  it("Has at least two events", () => {
    expect(allData.length).toBeGreaterThanOrEqual(2);
  });

  const data = allData.slice(-2)[1];

  it("Correct tx data", () => {
    expect(data.action).toBe(TunaLpPositionsActionType.openPosition);
    expect(data.txSignature).toBe(
      "w1yPPU73Te9oKSCx2qzXr8eBnXze76YWJXUUYhr9PqcXhvBuCtYucE9xMJtW63czYwRmCBvvvcdwG6P5mmKeMfp",
    );
    expect(data.txTimestamp).toEqual(new Date("2025-03-07T19:32:20Z"));
  });

  it("Correct action data defined", () => {
    expect(data.data.parameters).toBeDefined();
  });

  it("Correct position parameters", () => {
    const parameters = data.data.parameters!;
    expect(parameters.lowerPrice).toBe(139.97356627043357);
    expect(parameters.upperPrice).toBe(209.98441502144416);
    expect(parameters.lowerLimitOrder).toBeNull();
    expect(parameters.lowerLimitOrderSwap).toBe(TunaLpPositionLimitOrderSwap.swapToTokenB);
    expect(parameters.upperLimitOrder).toBeNull();
    expect(parameters.upperLimitOrderSwap).toBe(TunaLpPositionLimitOrderSwap.swapToTokenA);
    expect(parameters.autoCompound).toBe(TunaLpPositionAutoCompound.noAutoCompound);
  });
});

describe("Increase liquidity action", async () => {
  const allData = await unwrap(getLpPositionActions(TEST_WALLET_ADDRESS, LP_POSITION_WITH_LEVERAGE));

  it("Has at least two events", () => {
    expect(allData.length).toBeGreaterThanOrEqual(2);
  });

  const data = allData.slice(-2)[0];

  it("Correct tx data", () => {
    expect(data.action).toBe(TunaLpPositionsActionType.increaseLiquidity);
    expect(data.txSignature).toBe(
      "w1yPPU73Te9oKSCx2qzXr8eBnXze76YWJXUUYhr9PqcXhvBuCtYucE9xMJtW63czYwRmCBvvvcdwG6P5mmKeMfp",
    );
    expect(data.txTimestamp).toEqual(new Date("2025-03-07T19:32:20Z"));
  });

  it("Correct action data defined", () => {
    expect(data.data.fromLending).toBeDefined();
    expect(data.data.fromOwner).toBeDefined();
    expect(data.data.toPosition).toBeDefined();
    expect(data.data.protocolFees).toBeDefined();
    expect(data.data.prices).toBeDefined();
  });
});
