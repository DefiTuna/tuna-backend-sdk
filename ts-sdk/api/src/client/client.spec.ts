// import camelcaseKeys from "camelcase-keys";
import { Decimal } from "decimal.js";
import { EventSource as NodeEventSource } from "eventsource";
// import { once } from "node:events";
import {
  afterAll,
  // beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  // NotificationEntity, schemas, SubscriptionPayload,
  TunaApiClient,
} from "./client";
// import { PoolSubscriptionTopic } from "./schemas";
import * as testUtils from "./testUtils";
import { HUNDRED_PERCENT, PoolToken } from "@crypticdot/defituna-client";
import { priceToTickIndex } from "@crypticdot/fusionamm-core";

vi.stubGlobal("EventSource", NodeEventSource);

const TEST_WALLET_ADDRESS = "CYCf8sBj4zLZheRovh37rWLe7pK8Yn5G7nb4SeBmgfMG";
const SOL_VAULT_ADDRESS = "Ev5X54o83Z3MDV6PzTT9jyGkCPj7zQUXe9apWmGcwLHF";
const SOL_USDC_ORCA_POOL_ADDRESS = "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE";
const SOL_USDC_FUSION_POOL_ADDRESS = "7VuKeevbvbQQcxz6N4SNLmuq6PYy4AcGQRDssoqo4t65";
const SOL_USDC_FUSION_MARKET_ADDRESS = "2oXrPNQy6GRwvgTAY5aBXoctD4RXNis2FTH9Ukp1mUkh";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_DECIMALS = 9;
const USDC_DECIMALS = 6;
const BPS_DENOMINATOR = 10000;

const baseURL = process.env.API_BASE_URL!;
const client = new TunaApiClient(baseURL);

describe("Config", async () => {
  /*
   * Restore baseURL back
   * */
  afterAll(() => {
    client.setConfig({ baseURL });
  });

  it("Properly sets config", () => {
    expect(client.baseURL).toBe(baseURL);
    client.setConfig({ baseURL: "/test-endpoint" });
    expect(client.baseURL).toBe("/test-endpoint");
  });
});

describe("Mints", async () => {
  const rpcVaults = await testUtils.getVaults();
  const mints = await client.getMints();

  it("Length matches rpc", () => {
    expect(mints.length).toBe(rpcVaults.length);
  });
  it("Match RPC vaults mints", () => {
    expect(rpcVaults.map(rpcVault => rpcVault.data.mint).sort()).toEqual(mints.map(mint => mint.mint).sort());
  });
  it("Have valid decimals", () => {
    expect(mints.every(mint => mint.decimals > 0)).toBe(true);
  });
});

describe("Single Mint", async () => {
  const rpcVaults = await testUtils.getVaults();
  const sampleMintAddress = rpcVaults[0].data.mint;
  const unsavedMintAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const mint = await client.getMint(sampleMintAddress);

  it("Returns mint data", () => {
    expect(mint.mint).toBe(sampleMintAddress);
    expect(mint.decimals).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved mint", async () => {
    await expect(() => client.getMint(unsavedMintAddress)).rejects.toThrowError(
      expect.objectContaining({
        code: 40401,
      }),
    );
  });
  it("Returns 400 for invalid mint", async () => {
    await expect(() => client.getMint("123")).rejects.toThrowError(
      expect.objectContaining({
        code: 40001,
      }),
    );
  });
});

describe("Markets", async () => {
  const rpcMarkets = await testUtils.getMarkets();
  const markets = await client.getMarkets();

  it("Length matches rpc", () => {
    expect(markets.length).toBe(rpcMarkets.length);
  });
  it("Match RPC markets addresses", () => {
    expect(rpcMarkets.map(rpcMarket => rpcMarket.address).sort()).toEqual(markets.map(market => market.address).sort());
  });
  it("Match RPC markets pool addresses", () => {
    expect(rpcMarkets.map(rpcMarket => rpcMarket.data.pool).sort()).toEqual(
      markets.map(market => market.poolAddress).sort(),
    );
  });
});

describe("Single Market", async () => {
  const rpcMarkets = await testUtils.getMarkets();
  const sampleMarketAddress = rpcMarkets[0].address;
  const unsavedMarketAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const market = await client.getMarket(sampleMarketAddress);

  it("Returns market data", () => {
    expect(market.address).toBe(sampleMarketAddress);
    expect(market.poolFeeRate).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved market", async () => {
    await expect(() => client.getMarket(unsavedMarketAddress)).rejects.toThrowError(
      expect.objectContaining({
        code: 40401,
      }),
    );
  });
  it("Returns 400 for invalid market", async () => {
    await expect(() => client.getMarket("123")).rejects.toThrowError(
      expect.objectContaining({
        code: 40001,
      }),
    );
  });
});

describe("Oracle Prices", async () => {
  const rpcVaults = await testUtils.getVaults();
  const nowTimestampSeconds = Date.now() / 1000;
  const oraclePrices = await client.getOraclePrices();

  it("Length matches RPC vaults", () => {
    expect(oraclePrices.length).toBe(rpcVaults.length);
  });
  it("Match RPC vaults mints", () => {
    expect(rpcVaults.map(rpcVault => rpcVault.data.mint).sort()).toEqual(oraclePrices.map(price => price.mint).sort());
  });
  it("Returns recent prices", () => {
    const price = oraclePrices.find(price => price.mint == SOL_MINT)!;

    expect(price).toBeDefined();

    const priceTimestampSeconds = price.time.getTime() / 1000;

    // Not older that 60 seconds
    expect(priceTimestampSeconds).closeTo(nowTimestampSeconds, 60);
  });
  it("Returns correct price for USDT", () => {
    const price = oraclePrices.find(price => price.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");

    expect(price).toBeDefined();

    const value = new Decimal(price!.price.toString()).div(10 ** price!.decimals).toNumber();

    expect(value).closeTo(1, 0.05);
  });
  it("Returns correct price for USDC", () => {
    const price = oraclePrices.find(price => price.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

    expect(price).toBeDefined();

    const value = new Decimal(price!.price.toString()).div(10 ** price!.decimals).toNumber();

    expect(value).closeTo(1, 0.05);
  });
});

describe("Single Oracle Price", async () => {
  const unsavedMintAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const nowTimestampSeconds = Date.now() / 1000;
  const oraclePrice = await client.getOraclePrice(SOL_MINT);

  it("Returns oracle price", () => {
    expect(oraclePrice.price).toBeGreaterThan(0);
  });
  it("Returns recent price", () => {
    const priceTimestampSeconds = oraclePrice.time.getTime() / 1000;

    // Not older that 120 seconds
    expect(priceTimestampSeconds).closeTo(nowTimestampSeconds, 120);
  });
  it("Returns 404 for unsaved mint", async () => {
    await expect(() => client.getOraclePrice(unsavedMintAddress)).rejects.toThrowError(
      expect.objectContaining({
        code: 40401,
      }),
    );
  });
  it("Returns 400 for invalid mint", async () => {
    await expect(() => client.getOraclePrice("123")).rejects.toThrowError(
      expect.objectContaining({
        code: 40001,
      }),
    );
  });
});

describe("Vaults", async () => {
  const rpcVaults = await testUtils.getVaults();
  const vaults = await client.getVaults();

  it("Length matches rpc", () => {
    expect(rpcVaults.length).toBe(vaults.length);
  });
  it("Match RPC vaults addresses", () => {
    expect(rpcVaults.map(rpcVault => rpcVault.address).sort()).toEqual(vaults.map(vault => vault.address).sort());
  });
  it("Match RPC vaults supply limits", () => {
    expect(
      rpcVaults
        .map(rpcVault => [rpcVault.address, rpcVault.data.supplyLimit])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    ).toEqual(
      vaults
        .map(vault => [vault.address, vault.supplyLimit.amount])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    );
  });
});

describe("Single Vault", async () => {
  const unsavedVaultAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const vault = await client.getVault(SOL_VAULT_ADDRESS);
  const history = await client.getVaultHistory(SOL_VAULT_ADDRESS, new Date(2025, 3, 1), new Date(2025, 5, 1));

  it("Returns vault data", () => {
    expect(vault.address).toBe(SOL_VAULT_ADDRESS);
    expect(vault.mint).toBe(SOL_MINT);
  });

  it("Returns vault historical data", () => {
    expect(history.length).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved vault", async () => {
    await expect(() => client.getMarket(unsavedVaultAddress)).rejects.toThrowError(
      expect.objectContaining({
        code: 40401,
      }),
    );
  });
  it("Returns 400 for invalid vault", async () => {
    await expect(() => client.getMarket("123")).rejects.toThrowError(
      expect.objectContaining({
        code: 40001,
      }),
    );
  });
});

describe("Single Pool", async () => {
  const rpcMarkets = await testUtils.getMarkets();
  const samplePoolAddress = rpcMarkets[0].data.pool;
  const unsavedPoolAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const pool = await client.getPool(samplePoolAddress);

  it("Returns pool data", () => {
    expect(pool.address).toBe(samplePoolAddress);
    expect(pool.feeRate).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved pool", async () => {
    await expect(() => client.getMarket(unsavedPoolAddress)).rejects.toThrowError(
      expect.objectContaining({
        code: 40401,
      }),
    );
  });
  it("Returns 400 for invalid pool", async () => {
    await expect(() => client.getMarket("123")).rejects.toThrowError(
      expect.objectContaining({
        code: 40001,
      }),
    );
  });
});

describe("Pool Ticks", async () => {
  const poolTicks = await client.getPoolTicks("FwewVm8u6tFPGewAyHmWAqad9hmF7mvqxK4mJ7iNqqGC");

  it("Have tick spacing", () => {
    expect(poolTicks.tickSpacing > 0).toBe(true);
  });
  it("Have non-empty middle tick", () => {
    expect(poolTicks.ticks[Math.round(poolTicks.ticks.length / 2)].liquidity).not.toBe(0n);
  });
});

describe("Lending Positions", async () => {
  const lendingPositions = await client.getUserLendingPositions(TEST_WALLET_ADDRESS);
  const rpcLendingPositions = await testUtils.getLendingPositions(TEST_WALLET_ADDRESS);
  const testPosition = await client.getUserLendingPositionByAddress(
    TEST_WALLET_ADDRESS,
    "HDKqLtVBMBSb9Rv1zod4nEHn2c5aHkJq7QVv3hkphus3",
  );

  it("Length matches RPC lending positions", () => {
    expect(lendingPositions.length).toBe(rpcLendingPositions.length);
  });
  it("Match RPC lending positions addresses", () => {
    expect(lendingPositions.map(position => position.address).sort()).toEqual(
      rpcLendingPositions.map(position => position.address).sort(),
    );
  });
  it("Match RPC lending positions data", () => {
    expect(
      rpcLendingPositions
        .map(({ address, data }) => [address, data.authority, data.poolMint, data.depositedFunds])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    ).toEqual(
      lendingPositions
        .map(position => [
          position.address,
          position.authority,
          position.mint,
          position.funds.amount - position.earned.amount,
        ])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    );
  });
  it("Have USD values for tokens", () => {
    expect(lendingPositions.every(position => position.funds.usd > 0 && position.earned.usd > 0)).toBe(true);
  });
  it("Has correct values for sample position", () => {
    expect(testPosition.funds.amount).toBeGreaterThanOrEqual(20017787n);
    expect(testPosition.earned.amount).toBeGreaterThanOrEqual(17787n);
    expect(testPosition.mint).toEqual("So11111111111111111111111111111111111111112");
    expect(testPosition.vault).toEqual("Ev5X54o83Z3MDV6PzTT9jyGkCPj7zQUXe9apWmGcwLHF");
  });
});

describe("Tuna Positions", async () => {
  const tunaPositions = await client.getUserTunaPositions(TEST_WALLET_ADDRESS);
  const rpcTunaPositions = await testUtils.getTunaPositions(TEST_WALLET_ADDRESS);
  const testPositionWithoutLeverage = await client.getUserTunaPositionByAddress(
    TEST_WALLET_ADDRESS,
    "6SaKKYAAddvbMoqpoUyrDTkTv9qxifVpTcip539LFNjs",
  );
  const testPositionWithLeverage = await client.getUserTunaPositionByAddress(
    TEST_WALLET_ADDRESS,
    "AiNPCv5iqPxXCfmfn7ySGQ6mBRKMN3pM8wXNmm6VPbEq",
  );

  it("Length matches RPC tuna positions", () => {
    expect(tunaPositions.length).toBe(rpcTunaPositions.length);
  });
  it("Match RPC tuna positions addresses", () => {
    expect(tunaPositions.map(position => position.address).sort()).toEqual(
      rpcTunaPositions.map(position => position.address).sort(),
    );
  });
  it("Match RPC tuna positions data", () => {
    expect(
      rpcTunaPositions
        .map(({ address, data }) => [address, data.authority, data.positionMint, data.pool, data.liquidity])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    ).toEqual(
      tunaPositions
        .map(position => [
          position.address,
          position.authority,
          position.positionMint,
          position.pool,
          position.liquidity,
        ])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    );
  });
  it("Have USD values for tokens", () => {
    expect(tunaPositions.every(position => position.totalA.usd + position.totalB.usd > 0)).toBe(true);
  });
  it("Has correct values for position without leverage", () => {
    expect(testPositionWithoutLeverage.currentLoanA.amount + testPositionWithoutLeverage.currentLoanB.amount).toBe(0n);
    expect(testPositionWithoutLeverage.yieldA.amount).toBeGreaterThanOrEqual(38556n);
    expect(testPositionWithoutLeverage.yieldB.amount).toBeGreaterThanOrEqual(4435n);
  });
  it("Has correct values for position with leverage", () => {
    expect(testPositionWithLeverage.currentLoanA.amount + testPositionWithLeverage.currentLoanB.amount).toBeGreaterThan(
      0n,
    );
    expect(testPositionWithLeverage.currentLoanA.amount).toBeGreaterThanOrEqual(168783n);
    expect(testPositionWithLeverage.currentLoanB.amount).toBeGreaterThanOrEqual(25002n);
    expect(testPositionWithLeverage.yieldA.amount).toBeGreaterThanOrEqual(1680n);
    expect(testPositionWithLeverage.yieldB.amount).toBeGreaterThanOrEqual(189n);
  });
});

describe("Limit orders", async () => {
  const activeLimitOrders = await client.getUserLimitOrders(TEST_WALLET_ADDRESS, {
    status: ["open", "filled", "partially_filled"],
  });
  const historicalLimitOrders = await client.getUserLimitOrders(TEST_WALLET_ADDRESS, {
    status: ["cancelled", "complete"],
  });

  it("Active orders length matches RPC tuna positions", () => {
    expect(activeLimitOrders.length).toBeGreaterThan(0);
  });
  it("Returns historical limit orders", () => {
    expect(historicalLimitOrders.length).toBeGreaterThan(0);
  });
});

describe("Trade history", async () => {
  const tradeHistoryEntries = await client.getUserTradeHistory(TEST_WALLET_ADDRESS);

  it("Has items", () => {
    expect(tradeHistoryEntries.length).toBeGreaterThan(0);
  });
});

describe("Order history", async () => {
  const orderHistoryEntries = await client.getUserOrderHistory(TEST_WALLET_ADDRESS);

  it("Has items", () => {
    expect(orderHistoryEntries.length).toBeGreaterThan(0);
  });
});

describe("Limit Order Quotes", async () => {
  it("Calculates limit order quote by input", async () => {
    const solAmountIn = testUtils.numberToBigint(1, SOL_DECIMALS);
    let tickIndex = priceToTickIndex(200, 0, 0);
    // Selling 1 SOL at ~200 USDC / SOL price
    let limitOrderQuoteByInput = await client.getLimitOrderQuoteByInput({
      pool: SOL_USDC_FUSION_POOL_ADDRESS,
      amountIn: solAmountIn,
      aToB: true,
      tickIndex,
    });
    expect(limitOrderQuoteByInput.amountOut).toEqual(200053968277n);
  });

  it("Calculates limit order quote by output", async () => {
    const usdcAmountOut = 200053968277n;
    let tickIndex = priceToTickIndex(200, 0, 0);
    // Selling 1 SOL at ~200 USDC / SOL price
    let limitOrderQuoteByOutput = await client.getLimitOrderQuoteByOutput({
      pool: SOL_USDC_FUSION_POOL_ADDRESS,
      amountOut: usdcAmountOut,
      aToB: true,
      tickIndex,
    });
    expect(limitOrderQuoteByOutput.amountIn).toEqual(1000000000n);
  });
});

describe("Quotes", async () => {
  const oraclePrices = await client.getOraclePrices();
  const solOraclePrice = oraclePrices.find(oraclePrice => oraclePrice.mint == SOL_MINT)!;
  const usdcOraclePrice = oraclePrices.find(oraclePrice => oraclePrice.mint == USDC_MINT)!;
  const solPrice = testUtils.bigintToNumber(solOraclePrice.price, solOraclePrice.decimals);
  const usdcPrice = testUtils.bigintToNumber(usdcOraclePrice.price, usdcOraclePrice.decimals);

  it("Calculates swap quote by input", async () => {
    const solAmountIn = testUtils.numberToBigint(1, SOL_DECIMALS);
    let swapQuoteByInput = await client.getSwapQuoteByInput({
      pool: SOL_USDC_FUSION_POOL_ADDRESS,
      amountIn: solAmountIn,
      aToB: true,
      slippageToleranceBps: BPS_DENOMINATOR,
    });
    const usdcAmountOut = testUtils.bigintToNumber(swapQuoteByInput.estimatedAmountOut, USDC_DECIMALS);
    const usdcAmountOutUsd = usdcAmountOut * usdcPrice;
    // 1% deviation from oracle price
    const deviation = usdcAmountOut / 100;
    expect(usdcAmountOutUsd).closeTo(solPrice, deviation);
    expect(swapQuoteByInput.feeAmount).toBeGreaterThan(0n);
  });

  it("Calculates swap quote by output", async () => {
    const solAmountOut = testUtils.numberToBigint(1, SOL_DECIMALS);
    let swapQuoteByOutput = await client.getSwapQuoteByOutput({
      pool: SOL_USDC_FUSION_POOL_ADDRESS,
      amountOut: solAmountOut,
      aToB: true,
      slippageToleranceBps: BPS_DENOMINATOR,
    });
    const usdcAmountIn = testUtils.bigintToNumber(swapQuoteByOutput.estimatedAmountIn, USDC_DECIMALS);
    const usdcAmountInUsd = usdcAmountIn * usdcPrice;
    // 1% deviation from oracle price
    const deviation = usdcAmountIn / 100;
    expect(usdcAmountInUsd).closeTo(solPrice, deviation);
    expect(swapQuoteByOutput.feeAmount).toBeGreaterThan(0n);
  });

  it("Calculates increase spot position quote for new position", async () => {
    const usdcIncreaseAmount = testUtils.numberToBigint(2, USDC_DECIMALS);
    const leverage = 2;
    let increaseSpotPositionQuote = await client.getIncreaseSpotPositionQuote({
      market: SOL_USDC_FUSION_MARKET_ADDRESS,
      increaseAmount: usdcIncreaseAmount,
      collateralToken: PoolToken.B,
      positionToken: PoolToken.A,
      leverage,
      slippageTolerance: BPS_DENOMINATOR,
    });

    expect(increaseSpotPositionQuote.borrowAmount).toEqual(usdcIncreaseAmount / BigInt(leverage));
    expect(increaseSpotPositionQuote.uiLiquidationPrice).toBeGreaterThan(0);
    expect(increaseSpotPositionQuote.protocolFeeA + increaseSpotPositionQuote.protocolFeeB).toBeGreaterThan(0n);
  });

  it("Calculates increase spot position quote for existing position", async () => {
    const usdcIncreaseAmount = testUtils.numberToBigint(2, USDC_DECIMALS);
    const positionAmount = testUtils.numberToBigint(1, SOL_DECIMALS);
    const positionDebt = testUtils.numberToBigint(150, USDC_DECIMALS);
    const leverage = 2;
    let increaseSpotPositionQuote = await client.getIncreaseSpotPositionQuote({
      market: SOL_USDC_FUSION_MARKET_ADDRESS,
      increaseAmount: usdcIncreaseAmount,
      collateralToken: PoolToken.B,
      positionToken: PoolToken.A,
      leverage,
      positionAmount,
      positionDebt,
      slippageTolerance: BPS_DENOMINATOR,
    });
    expect(increaseSpotPositionQuote.borrowAmount).toEqual(usdcIncreaseAmount / BigInt(leverage));
    expect(increaseSpotPositionQuote.uiLiquidationPrice).toBeGreaterThan(0);
    expect(increaseSpotPositionQuote.protocolFeeA + increaseSpotPositionQuote.protocolFeeB).toBeGreaterThan(0n);
  });

  it("Calculates decrease spot position quote", async () => {
    const usdcDecreaseAmount = testUtils.numberToBigint(100, USDC_DECIMALS);
    const leverage = 2;
    const positionAmount = testUtils.numberToBigint(10, SOL_DECIMALS);
    const positionDebt = testUtils.numberToBigint(500, USDC_DECIMALS);
    let decreaseSpotPositionQuote = await client.getDecreaseSpotPositionQuote({
      market: SOL_USDC_FUSION_MARKET_ADDRESS,
      decreaseAmount: usdcDecreaseAmount,
      collateralToken: PoolToken.B,
      positionToken: PoolToken.A,
      leverage,
      positionAmount,
      positionDebt,
      slippageTolerance: BPS_DENOMINATOR,
    });
    expect(decreaseSpotPositionQuote.uiLiquidationPrice).toBeGreaterThan(0);
  });

  it("Calculates close spot position quote", async () => {
    const positionAmount = testUtils.numberToBigint(10, SOL_DECIMALS);
    const positionDebt = testUtils.numberToBigint(500, USDC_DECIMALS);
    let decreaseSpotPositionQuote = await client.getCloseSpotPositionQuote({
      market: SOL_USDC_FUSION_MARKET_ADDRESS,
      decreasePercent: HUNDRED_PERCENT,
      collateralToken: PoolToken.B,
      positionToken: PoolToken.A,
      positionAmount,
      positionDebt,
      slippageTolerance: BPS_DENOMINATOR,
    });
    expect(decreaseSpotPositionQuote.decreasePercent).toBe(1);
  });
});

// describe("Tradable Amount", async () => {
//   const availableBalance = testUtils.numberToBigint(1, SOL_DECIMALS);
//   const positionAmount = testUtils.numberToBigint(1, SOL_DECIMALS);
//   const positionDebt = 0n;
//   const leverage = 2;
//   const tradableAmount = await client.getTradableAmount(
//     SOL_USDC_FUSION_MARKET_ADDRESS,
//     PoolToken.A,
//     PoolToken.A,
//     PoolToken.B,
//     availableBalance,
//     leverage,
//     false,
//     positionAmount,
//     positionDebt,
//   );

//   console.log(tradableAmount);
// });

describe("Spot Positions", async () => {
  const tunaPositions = await client.getUserTunaSpotPositions(TEST_WALLET_ADDRESS);
  const rpcTunaPositions = await testUtils.getTunaSpotPositions(TEST_WALLET_ADDRESS);

  it("Length matches RPC tuna positions", () => {
    expect(tunaPositions.length).toBe(rpcTunaPositions.length);
  });
  it("Match RPC tuna positions addresses", () => {
    expect(tunaPositions.map(position => position.address).sort()).toEqual(
      rpcTunaPositions.map(position => position.address).sort(),
    );
  });
  it("Match RPC tuna positions data", () => {
    expect(
      rpcTunaPositions
        .map(({ address, data }) => [
          address,
          data.authority,
          data.pool,
          data.collateralToken,
          data.positionToken,
          data.loanFunds,
        ])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    ).toEqual(
      tunaPositions
        .map(position => [
          position.address,
          position.authority,
          position.pool,
          position.collateralToken,
          position.positionToken,
          position.loanFunds.amount,
        ])
        .sort(([a], [b]) => a.toString().localeCompare(b.toString())),
    );
  });
  it("Have USD values for tokens", () => {
    expect(tunaPositions.every(position => position.total.usd > 0)).toBe(true);
  });
});

describe("Pool swaps", async () => {
  const nowTimestampSeconds = Date.now() / 1000;
  const poolSwaps = await client.getPoolSwaps(SOL_USDC_ORCA_POOL_ADDRESS);

  it("Returns correct data", () => {
    expect(poolSwaps.length).toBeGreaterThan(0);
    const sampleSwap = poolSwaps[0];
    expect(sampleSwap.amountIn).toBeGreaterThan(0n);
    expect(sampleSwap.amountOut).toBeGreaterThan(0n);
    const swapTimestampSeconds = sampleSwap.time.getTime() / 1000;
    expect(swapTimestampSeconds).closeTo(nowTimestampSeconds, 60);
  });
});

describe("Staking", async () => {
  const treasury = await client.getStakingTreasury();
  const position = await client.getUserStakingPosition(TEST_WALLET_ADDRESS);
  const history = await client.getUserStakingPositionHistory(TEST_WALLET_ADDRESS);

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
  const firstPage = await client.getStakingLeaderboard(1, 10);
  const secondPage = await client.getStakingLeaderboard(2, 20);
  const searchPage = await client.getStakingLeaderboard(1, 20, "c31");

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
  const stats = await client.getStakingRevenueStats(new Date("2025-01-01"), new Date("2025-07-30"));

  it("Returns revenue stats", () => {
    expect(stats.length).toBeGreaterThan(0);
  });
});

// describe(
//   "Pool updates stream",
//   async () => {
//     let poolUpdatesStream: EventSource;

//     beforeAll(async () => {
//       // poolUpdatesStream = await client.getPoolUpdatesStream(SOL_USDC_ORCA_POOL_ADDRESS);
//     });

//     afterAll(() => {
//       // poolUpdatesStream.close();
//     });

//     it("Receives messages", async () => {
//       const event = (await once(poolUpdatesStream, "message")) as MessageEvent<string>[];
//       const rawUpdate = camelcaseKeys(JSON.parse(event[0].data), { deep: true });

//       if (rawUpdate.entity === NotificationEntity.POOL_SWAP) {
//         const poolSwapNotification = schemas.PoolSwapNotification.parse(rawUpdate);
//         expect(poolSwapNotification.data.amountIn).toBeGreaterThan(0n);
//         expect(poolSwapNotification.data.amountOut).toBeGreaterThan(0n);
//       }
//     });
//   },
//   { timeout: 30000 },
// );

// describe(
//   "General updates stream",
//   async () => {
//     let updatesStream: EventSource;

//     beforeAll(async () => {
//       updatesStream = await client.getUpdatesStream();
//     });

//     afterAll(() => {
//       updatesStream.close();
//     });

//     it("Receives messages", async () => {
//       const firstEvent = (await once(updatesStream, "message")) as MessageEvent<string>[];
//       const streamId = camelcaseKeys(JSON.parse(firstEvent[0].data), { deep: true }).streamId as string;
//       const subscription: SubscriptionPayload = {
//         pools: [{ address: SOL_USDC_ORCA_POOL_ADDRESS, topics: [PoolSubscriptionTopic.POOL_SWAPS] }],
//       };
//       await client.updateStreamSubscription(streamId, subscription);
//       const secondEvent = (await once(updatesStream, "message")) as MessageEvent<string>[];
//       const rawUpdate = camelcaseKeys(JSON.parse(secondEvent[0].data), { deep: true });
//       if (rawUpdate.entity === NotificationEntity.POOL_SWAP) {
//         const poolSwapNotification = schemas.PoolSwapNotification.parse(rawUpdate);
//         expect(poolSwapNotification.data.amountIn).toBeGreaterThan(0n);
//         expect(poolSwapNotification.data.amountOut).toBeGreaterThan(0n);
//       }
//     });
//   },
//   { timeout: 30000 },
// );
