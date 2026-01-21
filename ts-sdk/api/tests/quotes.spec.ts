import { HUNDRED_PERCENT, PoolToken } from "@crypticdot/defituna-client";
import { priceToTickIndex } from "@crypticdot/fusionamm-core";
import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { SOL_MINT, SOL_USDC_FUSION_MARKET_ADDRESS, SOL_USDC_FUSION_POOL_ADDRESS, USDC_MINT } from "./consts";
import { bigintToNumber, numberToBigint } from "./rpc";
import { sdk } from "./sdk";

const SOL_DECIMALS = 9;
const USDC_DECIMALS = 6;
const BPS_DENOMINATOR = 10000;

describe("Limit Order Quotes", async () => {
  it("Calculates limit order quote by input", async () => {
    const solAmountIn = numberToBigint(1, SOL_DECIMALS);
    const tickIndex = priceToTickIndex(200, 0, 0);
    // Selling 1 SOL at ~200 USDC / SOL price
    const limitOrderQuoteByInput = await unwrap(
      sdk.getLimitOrderQuoteByInput({
        query: {
          pool: SOL_USDC_FUSION_POOL_ADDRESS,
          amountIn: solAmountIn,
          aToB: true,
          tickIndex,
        },
      }),
    );
    expect(limitOrderQuoteByInput.amountOut).toEqual(200053968277n);
    expect(limitOrderQuoteByInput.amountOut).toBeTypeOf("bigint");
  });

  it("Calculates limit order quote by output", async () => {
    const usdcAmountOut = 200053968277n;
    const tickIndex = priceToTickIndex(200, 0, 0);
    // Selling 1 SOL at ~200 USDC / SOL price
    const limitOrderQuoteByOutput = await unwrap(
      sdk.getLimitOrderQuoteByOutput({
        query: {
          pool: SOL_USDC_FUSION_POOL_ADDRESS,
          amountOut: usdcAmountOut,
          aToB: true,
          tickIndex,
        },
      }),
    );
    expect(limitOrderQuoteByOutput.amountIn).toEqual(1000000000n);
    expect(limitOrderQuoteByOutput.amountIn).toBeTypeOf("bigint");
  });
});

describe("Quotes", async () => {
  const oraclePrices = await unwrap(sdk.getOraclePrices());
  const solOraclePrice = oraclePrices.find(oraclePrice => oraclePrice.mint == SOL_MINT)!;
  const usdcOraclePrice = oraclePrices.find(oraclePrice => oraclePrice.mint == USDC_MINT)!;
  const solPrice = bigintToNumber(solOraclePrice.price, solOraclePrice.decimals);
  const usdcPrice = bigintToNumber(usdcOraclePrice.price, usdcOraclePrice.decimals);

  it("Calculates swap quote by input", async () => {
    const solAmountIn = numberToBigint(1, SOL_DECIMALS);
    const swapQuoteByInput = await unwrap(
      sdk.getSwapQuoteByInput({
        query: {
          pool: SOL_USDC_FUSION_POOL_ADDRESS,
          amountIn: solAmountIn,
          aToB: true,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );
    const usdcAmountOut = bigintToNumber(swapQuoteByInput.estimatedAmountOut, USDC_DECIMALS);
    const usdcAmountOutUsd = usdcAmountOut * usdcPrice;
    // 1% deviation from oracle price
    const deviation = usdcAmountOut / 100;
    expect(usdcAmountOutUsd).closeTo(solPrice, deviation);
    expect(swapQuoteByInput.feeAmount).toBeGreaterThan(0n);
  });

  it("Calculates swap quote by output", async () => {
    const solAmountOut = numberToBigint(1, SOL_DECIMALS);
    const swapQuoteByOutput = await unwrap(
      sdk.getSwapQuoteByOutput({
        query: {
          pool: SOL_USDC_FUSION_POOL_ADDRESS,
          amountOut: solAmountOut,
          aToB: true,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );
    const usdcAmountIn = bigintToNumber(swapQuoteByOutput.estimatedAmountIn, USDC_DECIMALS);
    const usdcAmountInUsd = usdcAmountIn * usdcPrice;
    // 1% deviation from oracle price
    const deviation = usdcAmountIn / 100;
    expect(usdcAmountInUsd).closeTo(solPrice, deviation);
    expect(swapQuoteByOutput.feeAmount).toBeGreaterThan(0n);
  });

  it("Calculates increase spot position quote for new position", async () => {
    const usdcIncreaseAmount = numberToBigint(2, USDC_DECIMALS);
    const leverage = 2;
    const increaseSpotPositionQuote = await unwrap(
      sdk.getIncreaseSpotPositionQuote({
        query: {
          market: SOL_USDC_FUSION_MARKET_ADDRESS,
          increaseAmount: usdcIncreaseAmount,
          collateralToken: PoolToken.B,
          positionToken: PoolToken.A,
          leverage,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );

    expect(increaseSpotPositionQuote.borrowAmount).toEqual(usdcIncreaseAmount / BigInt(leverage));
    expect(increaseSpotPositionQuote.liquidationPrice).toBeGreaterThan(0);
    expect(increaseSpotPositionQuote.protocolFeeA + increaseSpotPositionQuote.protocolFeeB).toBeGreaterThan(0n);
  });

  it("Calculates increase spot position quote for existing position", async () => {
    const usdcIncreaseAmount = numberToBigint(2, USDC_DECIMALS);
    const positionAmount = numberToBigint(1, SOL_DECIMALS);
    const positionDebt = numberToBigint(150, USDC_DECIMALS);
    const leverage = 2;
    const increaseSpotPositionQuote = await unwrap(
      sdk.getIncreaseSpotPositionQuote({
        query: {
          market: SOL_USDC_FUSION_MARKET_ADDRESS,
          increaseAmount: usdcIncreaseAmount,
          collateralToken: PoolToken.B,
          positionToken: PoolToken.A,
          leverage,
          positionAmount: positionAmount,
          positionDebt: positionDebt,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );
    expect(increaseSpotPositionQuote.borrowAmount).toEqual(usdcIncreaseAmount / BigInt(leverage));
    expect(increaseSpotPositionQuote.liquidationPrice).toBeGreaterThan(0);
    expect(increaseSpotPositionQuote.protocolFeeA + increaseSpotPositionQuote.protocolFeeB).toBeGreaterThan(0n);
  });

  it("Calculates decrease spot position quote", async () => {
    const usdcDecreaseAmount = numberToBigint(100, USDC_DECIMALS);
    const leverage = 2;
    const positionAmount = numberToBigint(10, SOL_DECIMALS);
    const positionDebt = numberToBigint(500, USDC_DECIMALS);
    const decreaseSpotPositionQuote = await unwrap(
      sdk.getDecreaseSpotPositionQuote({
        query: {
          market: SOL_USDC_FUSION_MARKET_ADDRESS,
          decreaseAmount: usdcDecreaseAmount,
          collateralToken: PoolToken.B,
          positionToken: PoolToken.A,
          leverage,
          positionAmount: positionAmount,
          positionDebt: positionDebt,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );
    expect(decreaseSpotPositionQuote.liquidationPrice).toBeGreaterThan(0);
  });

  it("Calculates close spot position quote", async () => {
    const positionAmount = numberToBigint(10, SOL_DECIMALS);
    const positionDebt = numberToBigint(500, USDC_DECIMALS);
    const decreaseSpotPositionQuote = await unwrap(
      sdk.getCloseSpotPositionQuote({
        query: {
          market: SOL_USDC_FUSION_MARKET_ADDRESS,
          decreasePercent: HUNDRED_PERCENT,
          collateralToken: PoolToken.B,
          positionToken: PoolToken.A,
          positionAmount: positionAmount,
          positionDebt: positionDebt,
          slippageTolerance: BPS_DENOMINATOR,
        },
      }),
    );
    expect(decreaseSpotPositionQuote.decreasePercent).toBe(1);
  });
});
