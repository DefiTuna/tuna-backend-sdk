import { describe, expect, it } from "vitest";

import {
  NotificationEntity,
  PoolSubscriptionTopic,
  SseResponse,
  SubscriptionOptions,
  unwrap,
  WalletSubscriptionTopic,
} from "../src";

import { SOL_USDC_FUSION_MARKET_ADDRESS, SOL_USDC_ORCA_POOL_ADDRESS, TEST_WALLET_ADDRESS } from "./consts";
import { sdk } from "./sdk";

const eventIsInitialMessage = (event: unknown): event is { entity: string; streamId: string } => {
  if (!event || typeof event !== "object") return false;
  return (event as { entity?: string }).entity === NotificationEntity.INITIAL_MESSAGE;
};

const eventIsPoolSwap = (event: unknown): event is { entity: string; data: { amountIn: bigint } } => {
  if (!event || typeof event !== "object") return false;
  return (event as { entity?: string }).entity === NotificationEntity.POOL_SWAP;
};

const eventIsStateSnapshot = (event: unknown): event is { entity: string; data: { orderBooks?: unknown } } => {
  if (!event || typeof event !== "object") return false;
  return (event as { entity?: string }).entity === NotificationEntity.STATE_SNAPSHOT;
};

const createStream = async (signal: AbortSignal) => {
  const result = await sdk.sse({
    headers: { Accept: "text/event-stream" },
    onSseError: error => {
      process.stderr.write(`SSE error: ${String(error)}\n`);
    },
    signal,
  });

  return result.stream as AsyncGenerator<SseResponse>;
};

const nextEvent = async (signal: AbortSignal, stream: AsyncGenerator<SseResponse>) => {
  if (signal.aborted) {
    throw new Error("SSE test aborted");
  }

  return Promise.race([
    stream.next(),
    new Promise<never>((_, reject) => {
      const onAbort = () => {
        signal.removeEventListener("abort", onAbort);
        reject(new Error("SSE test aborted"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }),
  ]);
};

describe("Pool swaps stream", { timeout: 30000 }, async () => {
  it("Receives swap", async ({ signal }) => {
    const stream = await createStream(signal);
    const firstEvent = await stream.next();
    const rawData = firstEvent.value;
    let streamId: string | undefined;
    if (eventIsInitialMessage(rawData)) {
      streamId = rawData.streamId;
    }
    expect(streamId).toBeDefined();

    const subscription: SubscriptionOptions = {
      pools: [
        {
          address: SOL_USDC_ORCA_POOL_ADDRESS,
          topics: [
            PoolSubscriptionTopic.POOL_SWAPS,
            PoolSubscriptionTopic.ORDER_BOOK,
            PoolSubscriptionTopic.POOL_PRICES,
          ],
        },
      ],
    };
    await unwrap(
      sdk.updateStreamSubscription({
        streamId: streamId!,
        subscriptionOptions: subscription,
      }),
    );
    let poolSwapFound = false;
    while (!poolSwapFound) {
      const event = await nextEvent(signal, stream);
      const rawData = event.value;
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
  it("Receives order book", async ({ signal }) => {
    const stream = await createStream(signal);

    const firstEvent = await nextEvent(signal, stream);
    const rawData = firstEvent.value;
    let streamId: string | undefined;
    if (eventIsInitialMessage(rawData)) {
      streamId = rawData.streamId;
    }
    expect(streamId).toBeDefined();

    const subscription: SubscriptionOptions = {
      markets: [SOL_USDC_FUSION_MARKET_ADDRESS],
      pools: [
        {
          address: SOL_USDC_ORCA_POOL_ADDRESS,
          topics: [PoolSubscriptionTopic.ORDER_BOOK],
          orderBookPriceStep: 1,
          isInverted: false,
        },
      ],
      wallet: {
        address: TEST_WALLET_ADDRESS,
        topics: [WalletSubscriptionTopic.TUNA_POSITIONS],
      },
    };
    await unwrap(
      sdk.updateStreamSubscription({
        streamId: streamId!,
        subscriptionOptions: subscription,
      }),
    );
    let orderBookFound = false;
    while (!orderBookFound) {
      const event = await nextEvent(signal, stream);
      const rawData = event.value;
      if (eventIsStateSnapshot(rawData)) {
        if (rawData.data.orderBooks !== undefined) {
          orderBookFound = true;
        }
      }
    }
    expect(orderBookFound).toBe(true);
  });
});
