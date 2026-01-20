import { describe, expect, it } from "vitest";

import { getVault, getVaultHistory, getVaults, setTunaBaseUrl, unwrap } from "../src";

import { SOL_LENDING_VAULT, SOL_MINT } from "./consts";
import { getVaultsFromRpc } from "./rpc";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("Vaults", async () => {
  const rpcVaults = await getVaultsFromRpc();
  const vaults = await unwrap(getVaults());

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
  const promise = getVaults({ signal: ab.signal });
  expect(promise).rejects.toThrow("This operation was aborted");
});

describe("Single Vault", async () => {
  const unsavedVaultAddress = "FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump";
  const vault = await unwrap(getVault(SOL_LENDING_VAULT));
  const response_history = await getVaultHistory(SOL_LENDING_VAULT, {
    from: new Date(2025, 3, 1).toISOString().slice(0, 10),
    to: new Date(2025, 5, 1).toISOString().slice(0, 10),
  });
  expect(response_history.status).toBe(200);
  if (response_history.status !== 200) {
    throw new Error(`Expected 200 from getVaultHistory, got ${response_history.status}`);
  }
  const history = response_history.data.data;

  it("Returns vault data", () => {
    expect(vault.address).toBe(SOL_LENDING_VAULT);
    expect(vault.mint).toBe(SOL_MINT);
  });

  it("Returns vault historical data", () => {
    expect(history.length).toBeGreaterThan(0);
  });

  it("Returns 404 for unsaved vault", async () => {
    const response = await getVault(unsavedVaultAddress);
    expect(response.status).toBe(404);
  });
  it("Returns 400 for invalid vault", async () => {
    const response = await getVault("123");
    expect(response.status).toBe(400);
  });
});
