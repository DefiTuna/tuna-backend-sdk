import camelcaseKeys from "camelcase-keys";
import { once } from "node:events";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  eventIsInitialMessage,
  eventIsPoolSwap,
  eventIsStateSnapshot,
  getSseUpdatesStream,
  PoolSubscriptionTopic,
  setTunaBaseUrl,
  SubscriptionOptions,
  updateStreamSubscription,
} from "../src";

import { SOL_USDC_ORCA_POOL_ADDRESS } from "./consts";

import "dotenv/config";

setTunaBaseUrl(process.env.API_BASE_URL!);

describe("General updates stream", { timeout: 30000 }, async () => {
  let updatesStream: EventSource;

  beforeAll(async () => {
    updatesStream = await getSseUpdatesStream();
  });

  afterAll(() => {
    updatesStream.close();
  });

  it("Receives messages", async () => {
    const firstEvent = (await once(updatesStream, "message")) as MessageEvent<string>[];
    const rawData = camelcaseKeys(JSON.parse(firstEvent[0].data), { deep: true });
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
      const rawData = camelcaseKeys(JSON.parse(event[0].data), { deep: true });
      if (eventIsStateSnapshot(rawData)) {
        continue;
      }
      if (eventIsPoolSwap(rawData)) {
        poolSwapFound = true;
      }
    }
  });
});
