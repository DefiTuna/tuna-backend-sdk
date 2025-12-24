import z from "zod";

import { AmountWithUsdSchema } from "./basic";
import { LimitOrder } from "./limit_orders";
import { TunaLpPositionDtoSchema } from "./lp_positions";
import { OrderBook } from "./order_book";
import { TunaSpotPosition } from "./spot_positions";

export const PoolSnapshot = z.object({
  liquidity: z.coerce.bigint(),
  tickCurrentIndex: z.number(),
  price: z.number(),
  sqrtPrice: z.number(),
  tvl: z.number(),
  priceChange24H: z.number(),
  volume24H: z.number(),
  fees24H: z.number(),
  borrowedFundsA: AmountWithUsdSchema,
  borrowedFundsB: AmountWithUsdSchema,
  borrowLimitA: AmountWithUsdSchema,
  borrowLimitB: AmountWithUsdSchema,
});

export const StateSnapshot = z.object({
  slot: z.coerce.bigint(),
  blockTime: z.coerce.date(),
  pools: z.optional(z.record(z.string(), PoolSnapshot)),
  tunaSpotPositions: z.optional(z.array(TunaSpotPosition)),
  tunaLpPositions: z.optional(z.array(TunaLpPositionDtoSchema)),
  fusionLimitOrders: z.optional(z.array(LimitOrder)),
  orderBooks: z.optional(z.record(z.string(), OrderBook)),
});
