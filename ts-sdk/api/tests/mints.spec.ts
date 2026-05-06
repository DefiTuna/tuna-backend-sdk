import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { sdk } from "./sdk";

describe("Mints", async () => {
  const mints = await unwrap(sdk.getMints());
  const oraclePrices = await unwrap(sdk.getOraclePrices());
  const vaults = await unwrap(sdk.getVaults());
  const vaultMintSet = new Set(vaults.items.map(vault => vault.mint));
  const mintSet = new Set(mints.map(mint => mint.address));
  const globalVaults = vaults.items.filter(vault => vault.authority == null);
  const globalVaultMintSet = new Set(globalVaults.map(vault => vault.mint));

  it("Length matches oracle prices", () => {
    expect(mints.length).toBe(oraclePrices.length);
  });
  it("Match oracle prices mints", () => {
    expect([...mintSet].sort()).toEqual(oraclePrices.map(price => price.mint).sort());
  });
  it("Contains all vault mints", () => {
    expect([...vaultMintSet].every(vaultMint => mintSet.has(vaultMint))).toBe(true);
  });
  it("Global vault mints are unique", () => {
    expect(globalVaults.length).toBe(globalVaultMintSet.size);
  });
  it("Have valid decimals", () => {
    expect(mints.every(mint => mint.decimals > 0)).toBe(true);
  });
});

describe("Single Mint", async () => {
  const mints = await unwrap(sdk.getMints());
  const sampleMintAddress = mints[0].address;
  const unsavedMintAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const mint = await unwrap(
    sdk.getMint({
      mintAddress: sampleMintAddress,
    }),
  );

  it("Returns mint data", () => {
    expect(mint.address).toBe(sampleMintAddress);
    expect(mint.decimals).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved mint", async () => {
    const { response } = await sdk.getMint({
      mintAddress: unsavedMintAddress,
    });
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid mint", async () => {
    const { response } = await sdk.getMint({
      mintAddress: "123",
    });
    expect(response.status).toBe(400);
  });
});
