import * as DefiTunaClient from "@crypticdot/defituna-client";
import { address, createSolanaRpc, getAddressEncoder, getBase64Decoder, getBase64Encoder } from "@solana/kit";
import Decimal from "decimal.js";

const TUNA_PROGRAM_ID = DefiTunaClient.TUNA_PROGRAM_ADDRESS;

const base64Decoder = getBase64Decoder();
const base64Encoder = getBase64Encoder();
const addressEncoder = getAddressEncoder();
const rpc = createSolanaRpc(process.env.RPC_URL!);

export async function getMarketsFromRpc() {
  const accounts = await rpc
    .getProgramAccounts(TUNA_PROGRAM_ID, {
      filters: [{ dataSize: BigInt(DefiTunaClient.getMarketSize()) }],
      commitment: "processed",
      encoding: "base64",
      withContext: false,
    })
    .send();

  const decoder = DefiTunaClient.getMarketDecoder();

  const encodedAccounts = accounts.map(({ account: { data } }) => base64Encoder.encode(data[0]));
  const decodedAccounts = encodedAccounts.map(x => decoder.decode(x));

  return decodedAccounts.map((data, i) => ({
    ...accounts[i].account,
    address: accounts[i].pubkey,
    data,
  }));
}

export async function getVaultsFromRpc() {
  const accounts = await rpc
    .getProgramAccounts(TUNA_PROGRAM_ID, {
      filters: [{ dataSize: BigInt(DefiTunaClient.getVaultSize()) }],
      commitment: "processed",
      encoding: "base64",
      withContext: false,
    })
    .send();

  const decoder = DefiTunaClient.getVaultDecoder();

  const encodedAccounts = accounts.map(({ account: { data } }) => base64Encoder.encode(data[0]));
  const decodedAccounts = encodedAccounts.map(x => decoder.decode(x));

  return decodedAccounts.map((data, i) => ({
    ...accounts[i].account,
    address: accounts[i].pubkey,
    data,
  }));
}

export async function getLendingPositionsFromRpc(userAddress: string) {
  const accounts = await rpc
    .getProgramAccounts(TUNA_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 11n, // Discriminator + version + bump
            bytes: base64Decoder.decode(addressEncoder.encode(address(userAddress))),
            encoding: "base64",
          },
        },
        { dataSize: BigInt(DefiTunaClient.getLendingPositionSize()) },
      ],
      commitment: "processed",
      encoding: "base64",
      withContext: false,
    })
    .send();

  const decoder = DefiTunaClient.getLendingPositionDecoder();

  const encodedAccounts = accounts.map(({ account: { data } }) => base64Encoder.encode(data[0]));
  const decodedAccounts = encodedAccounts.map(x => decoder.decode(x));

  return decodedAccounts.map((data, i) => ({
    ...accounts[i].account,
    address: accounts[i].pubkey,
    data,
  }));
}

export async function getTunaPositionsFromRpc(userAddress: string) {
  const accounts = await rpc
    .getProgramAccounts(TUNA_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 11n, // Discriminator + version + bump
            bytes: base64Decoder.decode(addressEncoder.encode(address(userAddress))),
            encoding: "base64",
          },
        },
        { dataSize: BigInt(DefiTunaClient.getTunaLpPositionSize()) },
      ],
      commitment: "processed",
      encoding: "base64",
      withContext: false,
    })
    .send();

  const decoder = DefiTunaClient.getTunaLpPositionDecoder();

  const encodedAccounts = accounts.map(({ account: { data } }) => base64Encoder.encode(data[0]));
  const decodedAccounts = encodedAccounts.map(x => decoder.decode(x));

  return decodedAccounts.map((data, i) => ({
    ...accounts[i].account,
    address: accounts[i].pubkey,
    data,
  }));
}

export async function getTunaSpotPositionsFromRpc(userAddress: string) {
  const accounts = await rpc
    .getProgramAccounts(TUNA_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 11n, // Discriminator + version + bump
            bytes: base64Decoder.decode(addressEncoder.encode(address(userAddress))),
            encoding: "base64",
          },
        },
        { dataSize: BigInt(DefiTunaClient.getTunaSpotPositionSize()) },
      ],
      commitment: "processed",
      encoding: "base64",
      withContext: false,
    })
    .send();

  const decoder = DefiTunaClient.getTunaSpotPositionDecoder();

  const encodedAccounts = accounts.map(({ account: { data } }) => base64Encoder.encode(data[0]));
  const decodedAccounts = encodedAccounts.map(x => decoder.decode(x));

  return decodedAccounts.map((data, i) => ({
    ...accounts[i].account,
    address: accounts[i].pubkey,
    data,
  }));
}

function bigintToDecimal(value: bigint, decimals = 0) {
  if (decimals != 0) {
    const scale = 10 ** decimals;
    return new Decimal(value.toString()).div(scale);
  } else {
    return new Decimal(value.toString());
  }
}

export function bigintToNumber(value: bigint, decimals = 0) {
  return bigintToDecimal(value, decimals).toNumber();
}

function decimalToBigint(value: Decimal.Value, decimals = 0) {
  const scale = 10 ** decimals;
  return BigInt(new Decimal(value).mul(scale).toFixed(0));
}

export function numberToBigint(value: number, decimals = 0) {
  return decimalToBigint(value, decimals);
}
