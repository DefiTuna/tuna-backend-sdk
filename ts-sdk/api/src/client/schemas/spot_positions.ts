import { z } from "zod";

import { AmountWithUsdSchema, PoolProviderSchema, UsdPnlSchema } from "./basic";
import { Mint } from "./mint";
import { TunaPositionPoolSchema, TunaPositionPoolToken } from "./positions_shared";

export const TunaSpotPositionState = {
  OPEN: "open",
  CLOSED: "closed",
} as const;

export const TunaSpotPositionStateSchema = z.enum([
  TunaSpotPositionState.OPEN,
  ...Object.values(TunaSpotPositionState),
]);

export const TunaSpotPosition = z.object({
  address: z.string(),
  authority: z.string(),
  version: z.number(),
  state: TunaSpotPositionStateSchema,
  lowerLimitOrderPrice: z.number(),
  upperLimitOrderPrice: z.number(),
  entryPrice: z.number(),

  mintA: Mint,
  mintB: Mint,
  pool: TunaPositionPoolSchema,

  positionToken: TunaPositionPoolToken,
  collateralToken: TunaPositionPoolToken,

  marketMaker: PoolProviderSchema,

  depositedCollateral: AmountWithUsdSchema,

  initialDebt: AmountWithUsdSchema,
  currentDebt: AmountWithUsdSchema,

  total: AmountWithUsdSchema,

  leverage: z.number(),
  maxLeverage: z.number(),

  liquidationPrice: z.number(),

  pnlUsd: UsdPnlSchema,

  openedAt: z.coerce.date(),
  closedAt: z.nullable(z.coerce.date()),
});

export const IncreaseSpotPositionQuote = z.object({
  /** Required collateral amount */
  collateralAmount: z.coerce.bigint(),
  /** Required amount to borrow */
  borrowAmount: z.coerce.bigint(),
  /** Estimated position size in the position token. */
  estimatedAmount: z.coerce.bigint(),
  /** Swap input amount. */
  swapInputAmount: z.coerce.bigint(),
  /** Minimum swap output amount according to the provided slippage. */
  minSwapOutputAmount: z.coerce.bigint(),
  /** Protocol fee in token A */
  protocolFeeA: z.coerce.bigint(),
  /** Protocol fee in token B */
  protocolFeeB: z.coerce.bigint(),
  /** Price impact in percents */
  priceImpact: z.number(),
  /** Liquidation price */
  liquidationPrice: z.number(),
});

export const DecreaseSpotPositionQuote = z.object({
  /** Confirmed position decrease percentage (100% = 1.0) */
  decreasePercent: z.number(),
  /** The maximum acceptable swap input amount for position decrease according to the provided slippage
   * (if collateral_token == position_token) OR the minimum swap output amount (if collateral_token != position_token).
   */
  requiredSwapAmount: z.coerce.bigint(),
  /**  Estimated total amount of the adjusted position */
  estimatedAmount: z.coerce.bigint(),
  /** Estimated amount of the withdrawn collateral */
  estimatedWithdrawnCollateral: z.coerce.bigint(),
  /** Price impact in percents */
  priceImpact: z.number(),
  /** Liquidation price */
  liquidationPrice: z.number(),
});

export const CloseSpotPositionQuote = z.object({
  /** Position decrease percentage */
  decreasePercent: z.number(),
  /** The maximum acceptable swap input amount for position decrease according to the provided slippage
   * (if collateral_token == position_token) OR the minimum swap output amount (if collateral_token != position_token).
   */
  requiredSwapAmount: z.coerce.bigint(),
  /** Estimated amount of the withdrawn collateral */
  estimatedWithdrawnCollateral: z.coerce.bigint(),
  /** Price impact in percents */
  priceImpact: z.number(),
});
