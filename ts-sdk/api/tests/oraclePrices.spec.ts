import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { SOL_MINT, USDC_MINT } from "./consts";
import { sdk } from "./sdk";

describe("Oracle Prices", async () => {
  const nowTimestampSeconds = Date.now() / 1000;
  const oraclePrices = await unwrap(sdk.getOraclePrices());
  const mints = await unwrap(sdk.getMints());
  const vaults = await unwrap(sdk.getVaults());
  const oracleMintSet = new Set(oraclePrices.map(price => price.mint));
  const mintSet = new Set(mints.map(mint => mint.address));
  const vaultMintSet = new Set(vaults.items.map(vault => vault.mint));

  it("Length matches mints", () => {
    expect(oraclePrices.length).toBe(mints.length);
  });
  it("Match mints addresses", () => {
    expect([...mintSet].sort()).toEqual([...oracleMintSet].sort());
  });
  it("Contains all vault mints", () => {
    expect([...vaultMintSet].every(vaultMint => oracleMintSet.has(vaultMint))).toBe(true);
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
    const price = oraclePrices.find(price => price.mint === USDC_MINT);

    expect(price).toBeDefined();

    const value = new Decimal(price!.price.toString()).div(10 ** price!.decimals).toNumber();

    expect(value).closeTo(1, 0.05);
  });
});

describe("Single Oracle Price", async () => {
  const unsavedMintAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const nowTimestampSeconds = Date.now() / 1000;
  const oraclePrice = await unwrap(
    sdk.getOraclePrice({
      mintAddress: SOL_MINT,
    }),
  );

  it("Returns oracle price", () => {
    expect(oraclePrice.price).toBeGreaterThan(0);
  });
  it("Returns recent price", () => {
    const priceTimestampSeconds = oraclePrice.time.getTime() / 1000;

    // Not older that 120 seconds
    expect(priceTimestampSeconds).closeTo(nowTimestampSeconds, 120);
  });
  it("Returns 404 for unsaved mint", async () => {
    const { response } = await sdk.getOraclePrice({
      mintAddress: unsavedMintAddress,
    });
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid mint", async () => {
    const { response } = await sdk.getOraclePrice({
      mintAddress: "123",
    });
    expect(response.status).toBe(400);
  });
});
