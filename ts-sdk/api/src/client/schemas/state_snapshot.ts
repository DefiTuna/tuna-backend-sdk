import z from "zod";

import { LimitOrder } from "./limit_orders";
import { TunaLpPositionDtoSchema } from "./lp_positions";
import { OrderBookEntry } from "./order_book";
import { TunaSpotPosition } from "./spot_positions";

export const PoolPriceUpdate = z.object({
  pool: z.string(),
  price: z.number(),
  sqrtPrice: z.coerce.bigint(),
  time: z.coerce.date(),
});

export const OrderBookWrapper = z.object({
  priceStep: z.number(),
  entries: z.array(OrderBookEntry),
});

export const StateSnapshot = z.object({
  slot: z.coerce.bigint(),
  blockTime: z.coerce.date(),
  poolPrices: z.optional(z.record(z.string(), PoolPriceUpdate)),
  tunaSpotPositions: z.optional(z.array(TunaSpotPosition)),
  tunaLpPositions: z.optional(z.array(TunaLpPositionDtoSchema)),
  fusionLimitOrders: z.optional(z.array(LimitOrder)),
  orderBooks: z.optional(z.record(z.string(), OrderBookWrapper)),
});
