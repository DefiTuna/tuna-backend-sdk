import { z } from "zod";

import { AmountWithUsdSchema } from "./basic";
import { Pool } from "./pool";

export const LimitOrderState = {
  OPEN: "open",
  PARTIALLY_FILLED: "partially_filled",
  FILLED: "filled",
  COMPLETE: "complete",
  CANCELLED: "cancelled",
} as const;

export const LimitOrderStateSchema = z.enum([LimitOrderState.OPEN, ...Object.values(LimitOrderState)]);

export const LimitOrder = z.object({
  address: z.string(),
  orderMint: z.string(),
  authority: z.string(),
  pool: Pool,
  state: LimitOrderStateSchema,
  aToB: z.boolean(),
  tickIndex: z.number(),
  fillRatio: z.number(),
  openTxSignature: z.string(),
  closeTxSignature: z.nullable(z.string()),
  amountIn: AmountWithUsdSchema,
  amountOut: AmountWithUsdSchema,
  openedAt: z.coerce.date(),
  closedAt: z.nullable(z.coerce.date()),
});
