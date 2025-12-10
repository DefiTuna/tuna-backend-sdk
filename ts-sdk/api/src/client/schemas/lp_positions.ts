import z from "zod";

import { AmountWithUsdSchema, PoolProviderSchema, TokensPnlSchema, UsdPnlSchema } from "./basic";

export const TunaPositionState = {
  OPEN: "open",
  LIQUIDATED: "liquidated",
  CLOSED_BY_LIMIT_ORDER: "closed_by_limit_order",
  CLOSED: "closed",
} as const;
export const TunaPositionStateSchema = z.enum([TunaPositionState.OPEN, ...Object.values(TunaPositionState)]);

//

export const TunaLpPositionPoolToken = {
  A: "a",
  B: "b",
} as const;
export const TunaLpPositionPoolTokenSchema = z.enum(Object.values(TunaLpPositionPoolToken) as [string, ...string[]]);

//

export const TunaLpPositionAutoCompounding = {
  WITH_LEVERAGE: "with_leverage",
  WITHOUT_LEVERAGE: "without_leverage",
} as const;
export const TunaLpPositionAutoCompoundingSchema = z.enum(
  Object.values(TunaLpPositionAutoCompounding) as [string, ...string[]],
);

// Helper schemas
export const TunaPositionTokenPnlSchema = z.object({
  amount: z.coerce.bigint(),
  bps: z.number(),
});

export const TunaLpPositionMintSchema = z.object({
  addr: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

export const TunaLpPositionPoolSchema = z.object({
  addr: z.string(),
  price: z.number(),
  tickSpacing: z.number(),
});

export const TunaLpPositionFlagsSchema = z.object({
  lowerLimitOrderSwapToToken: z.nullable(TunaLpPositionPoolTokenSchema),
  upperLimitOrderSwapToToken: z.nullable(TunaLpPositionPoolTokenSchema),
  autoCompounding: z.nullable(TunaLpPositionAutoCompoundingSchema),
  autoRebalancing: z.boolean(),
});

// Main schema
export const TunaLpPositionDtoSchema = z.object({
  address: z.string(),
  authority: z.string(),
  version: z.number(),
  state: TunaPositionStateSchema,
  positionMint: z.string(),
  liquidity: z.coerce.bigint(),
  lowerPrice: z.number(),
  upperPrice: z.number(),
  lowerLimitOrderPrice: z.number(),
  upperLimitOrderPrice: z.number(),
  entryPrice: z.number(),
  flags: TunaLpPositionFlagsSchema,
  mintA: TunaLpPositionMintSchema,
  mintB: TunaLpPositionMintSchema,
  pool: TunaLpPositionPoolSchema,
  marketMaker: PoolProviderSchema,
  depositedCollateralA: AmountWithUsdSchema,
  depositedCollateralB: AmountWithUsdSchema,
  leverage: z.number(),
  liquidationPriceLower: z.number(),
  liquidationPriceUpper: z.number(),
  loanFundsA: AmountWithUsdSchema,
  loanFundsB: AmountWithUsdSchema,
  currentLoanA: AmountWithUsdSchema,
  currentLoanB: AmountWithUsdSchema,
  leftoversA: AmountWithUsdSchema,
  leftoversB: AmountWithUsdSchema,
  yieldA: AmountWithUsdSchema,
  yieldB: AmountWithUsdSchema,
  compoundedYieldA: AmountWithUsdSchema,
  compoundedYieldB: AmountWithUsdSchema,
  totalA: AmountWithUsdSchema,
  totalB: AmountWithUsdSchema,
  totalPnlA: TokensPnlSchema,
  totalPnlB: TokensPnlSchema,
  pnlUsd: UsdPnlSchema,
  openedAt: z.coerce.date(),
  updatedAtSlot: z.coerce.bigint(),
  closedAt: z.nullable(z.coerce.date()),
});
