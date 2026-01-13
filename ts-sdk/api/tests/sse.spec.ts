import { once } from "node:events";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  eventIsInitialMessage,
  eventIsPoolSwap,
  eventIsStateSnapshot,
  getSseUpdatesStream,
  normalizeResponseJson,
  PoolSubscriptionTopic,
  setTunaBaseUrl,
  SseResponse,
  SubscriptionOptions,
  updateStreamSubscription,
} from "../src";

import { SOL_USDC_ORCA_POOL_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("Pool swaps stream", { timeout: 30000 }, async () => {
  let updatesStream: EventSource;

  beforeAll(async () => {
    updatesStream = await getSseUpdatesStream();
  });

  afterAll(() => {
    updatesStream.close();
  });

  it("Receives swap", async () => {
    const firstEvent = (await once(updatesStream, "message")) as MessageEvent<string>[];
    const rawData = normalizeResponseJson(JSON.parse(firstEvent[0].data)) as SseResponse;
    let streamId: string | undefined;
    if (eventIsInitialMessage(rawData)) {
      streamId = rawData.streamId;
    }
    expect(streamId).toBeDefined();

    const subscription: SubscriptionOptions = {
      pools: [
        {
          address: SOL_USDC_ORCA_POOL_ADDRESS,
          topics: [PoolSubscriptionTopic.poolSwaps, PoolSubscriptionTopic.orderBook, PoolSubscriptionTopic.poolPrices],
        },
      ],
    };
    await updateStreamSubscription(streamId!, subscription);
    let poolSwapFound = false;
    while (!poolSwapFound) {
      const event = (await once(updatesStream, "message")) as MessageEvent<string>[];
      const rawData = normalizeResponseJson(JSON.parse(event[0].data)) as SseResponse;
      if (eventIsStateSnapshot(rawData)) {
        continue;
      }
      if (eventIsPoolSwap(rawData)) {
        poolSwapFound = true;
        expect(rawData.data.amountIn).toBeTypeOf("bigint");
      }
    }
    expect(poolSwapFound).toBe(true);
  });
});

describe("Order book stream", { timeout: 30000 }, async () => {
  let updatesStream: EventSource;

  beforeAll(async () => {
    updatesStream = await getSseUpdatesStream();
  });

  afterAll(() => {
    updatesStream.close();
  });

  it("Receives order book", async () => {
    const firstEvent = (await once(updatesStream, "message")) as MessageEvent<string>[];
    const rawData = normalizeResponseJson(JSON.parse(firstEvent[0].data)) as SseResponse;
    let streamId: string | undefined;
    if (eventIsInitialMessage(rawData)) {
      streamId = rawData.streamId;
    }
    expect(streamId).toBeDefined();

    const subscription: SubscriptionOptions = {
      markets: ["GVpfbqj7Bwhy9FnxhNcmqwzcascf9N2fPd6ZXqNeA2Lb"],
      pools: [
        {
          address: "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
          topics: ["order_book"],
          orderBookPriceStep: 1,
          isInverted: false,
        },
      ],
      wallet: {
        address: "5a27nXEhSrdLxkgp3kdBEwyhfvYNkdoe4jF4qM4mwBYK",
        topics: ["tuna_positions"],
      },
    };
    await updateStreamSubscription(streamId!, subscription);
    let orderBookFound = false;
    while (!orderBookFound) {
      const event = (await once(updatesStream, "message")) as MessageEvent<string>[];
      const rawData = normalizeResponseJson(JSON.parse(event[0].data)) as SseResponse;
      if (eventIsStateSnapshot(rawData)) {
        if (rawData.data.orderBooks !== undefined) {
          orderBookFound = true;
        }
      }
    }
    expect(orderBookFound).toBe(true);
  });
});
