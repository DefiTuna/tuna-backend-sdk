import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { getVaultsFromRpc } from "./rpc";
import { sdk } from "./sdk";

describe("Mints", async () => {
  const rpcVaults = await getVaultsFromRpc();
  const mints = await unwrap(sdk.getMints());

  it("Length matches rpc", () => {
    expect(mints.length).toBe(rpcVaults.length);
  });
  it("Match RPC vaults mints", () => {
    expect(rpcVaults.map(rpcVault => rpcVault.data.mint).sort()).toEqual(mints.map(mint => mint.address).sort());
  });
  it("Have valid decimals", () => {
    expect(mints.every(mint => mint.decimals > 0)).toBe(true);
  });
});

describe("Single Mint", async () => {
  const rpcVaults = await getVaultsFromRpc();
  const sampleMintAddress = rpcVaults[0].data.mint;
  const unsavedMintAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const mint = await unwrap(
    sdk.getMint({
      path: {
        mintAddress: sampleMintAddress,
      },
    }),
  );

  it("Returns mint data", () => {
    expect(mint.address).toBe(sampleMintAddress);
    expect(mint.decimals).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved mint", async () => {
    const response = await sdk.getMint({
      path: {
        mintAddress: unsavedMintAddress,
      },
    });
    expect(response.response.status).toBe(404);
  });
  it("Returns 400 for invalid mint", async () => {
    const response = await sdk.getMint({
      path: {
        mintAddress: "123",
      },
    });
    expect(response.response.status).toBe(400);
  });
});
