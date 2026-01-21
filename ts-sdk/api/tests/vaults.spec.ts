import { describe, expect, it } from "vitest";

import { unwrap } from "../src";

import { SOL_LENDING_VAULT, SOL_MINT } from "./consts";
import { getVaultsFromRpc } from "./rpc";
import { sdk } from "./sdk";

describe("Vaults", async () => {
  const rpcVaults = await getVaultsFromRpc();
  const vaults = await unwrap(sdk.getVaults());

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

describe("Abort signal", async () => {
  const ab = new AbortController();
  ab.abort();
  const promise = sdk.getVaults({ signal: ab.signal, throwOnError: true });
  expect(promise).rejects.toThrow("This operation was aborted");
});

describe("Single Vault", async () => {
  const unsavedVaultAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const vault = await unwrap(
    sdk.getVault({
      path: {
        vaultAddress: SOL_LENDING_VAULT,
      },
    }),
  );
  const responseHistory = await sdk.getVaultHistory({
    path: {
      vaultAddress: SOL_LENDING_VAULT,
    },
    query: {
      from: new Date(2025, 3, 1).toISOString().slice(0, 10),
      to: new Date(2025, 5, 1).toISOString().slice(0, 10),
    },
  });
  expect(responseHistory.response.status).toBe(200);
  if (responseHistory.response.status !== 200) {
    throw new Error(`Expected 200 from getVaultHistory, got ${responseHistory.response.status}`);
  }
  const history = await unwrap(Promise.resolve(responseHistory));

  it("Returns vault data", () => {
    expect(vault.address).toBe(SOL_LENDING_VAULT);
    expect(vault.mint).toBe(SOL_MINT);
  });

  it("Returns vault historical data", () => {
    expect(history.length).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved vault", async () => {
    const { response } = await sdk.getVault({
      path: {
        vaultAddress: unsavedVaultAddress,
      },
    });
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid vault", async () => {
    const { response } = await sdk.getVault({
      path: {
        vaultAddress: "123",
      },
    });
    expect(response.status).toBe(400);
  });
});
