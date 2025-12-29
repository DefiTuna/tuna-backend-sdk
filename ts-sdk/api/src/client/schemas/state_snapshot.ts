import z from "zod";

import { LimitOrder } from "./limit_orders";
import { TunaLpPositionDtoSchema } from "./lp_positions";
import { Market } from "./market";
import { OrderBook } from "./order_book";
import { TunaSpotPosition } from "./spot_positions";

export const StateSnapshot = z.object({
  slot: z.coerce.bigint(),
  blockTime: z.coerce.date(),
  markets: z.optional(z.record(z.string(), Market)),
  tunaSpotPositions: z.optional(z.array(TunaSpotPosition)),
  tunaLpPositions: z.optional(z.array(TunaLpPositionDtoSchema)),
  fusionLimitOrders: z.optional(z.array(LimitOrder)),
  orderBooks: z.optional(z.record(z.string(), OrderBook)),
});
