import { z } from "zod";

import { AmountWithUsdSchema } from "./basic";
import { Pool } from "./pool";

export const Market = z.object({
  address: z.string(),
  addressLookupTable: z.string(),
  maxLeverage: z.number(),
  maxSwapSlippage: z.number(),
  protocolFee: z.number(),
  protocolFeeOnCollateral: z.number(),
  liquidationFee: z.number(),
  liquidationThreshold: z.number(),
  oraclePriceDeviationThreshold: z.number(),
  rebalanceProtocolFee: z.number(),
  borrowedFundsA: AmountWithUsdSchema,
  borrowedFundsB: AmountWithUsdSchema,
  borrowLimitA: AmountWithUsdSchema,
  borrowLimitB: AmountWithUsdSchema,
  maxSpotPositionSizeA: AmountWithUsdSchema,
  maxSpotPositionSizeB: AmountWithUsdSchema,
  pool: Pool,
  disabled: z.boolean(),
  createdAt: z.coerce.date(),
});
