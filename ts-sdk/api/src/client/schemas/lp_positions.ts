import z from "zod";

import { AmountWithoutUsdSchema, AmountWithUsdSchema, TokensPnlSchema, UsdPnlSchema } from "./basic";
import { Mint } from "./mint";
import { PoolProviderSchema } from "./pool";
import { TunaPositionPoolSchema, TunaPositionPoolTokenSchema } from "./positions_shared";

export const LpPositionLimitOrderSwap = {
  NO_SWAP: "no_swap",
  SWAP_TO_TOKEN_A: "swap_to_token_a",
  SWAP_TO_TOKEN_B: "swap_to_token_b",
} as const;
export const LpPositionAutoCompound = {
  NO_AUTO_COMPOUND: "no_auto_compound",
  AUTO_COMPOUND: "auto_compound",
  AUTO_COMPOUND_WITH_LEVERAGE: "auto_compound_with_leverage",
} as const;
export const LpPositionRebalance = {
  NO_REBALANCE: "no_rebalance",
  AUTO_REBALANCE: "auto_rebalance",
} as const;
export const LpPositionsActionType = {
  OPEN_POSITION: "open_position",
  CLOSE_POSITION: "close_position",
  INCREASE_LIQUIDITY: "increase_liquidity",
  DECREASE_LIQUIDITY: "decrease_liquidity",
  REPAY_DEBT: "repay_debt",
  LIQUIDATE: "liquidate",
  EXECUTE_LIMIT_ORDER: "execute_limit_order",
  COLLECT_FEES: "collect_fees",
  COLLECT_REWARDS: "collect_rewards",
  COLLECT_AND_COMPOUND_FEES: "collect_and_compound_fees",
  REBALANCE_POSITION: "rebalance_position",
  SET_LIMIT_ORDERS: "set_limit_orders",
  SET_FLAGS: "set_flags",
  SET_REBALANCE_THRESHOLD: "set_rebalance_threshold",
} as const;

export const LpPositionLimitOrderSwapSchema = z.enum(Object.values(LpPositionLimitOrderSwap) as [string, ...string[]]);
export const LpPositionAutoCompoundSchema = z.enum(Object.values(LpPositionAutoCompound) as [string, ...string[]]);
export const LpPositionRebalanceSchema = z.enum(Object.values(LpPositionRebalance) as [string, ...string[]]);

export const LpPositionsActionTypeSchema = z.enum(Object.values(LpPositionsActionType) as [string, ...string[]]);

export const TunaPositionState = {
  OPEN: "open",
  LIQUIDATED: "liquidated",
  CLOSED_BY_LIMIT_ORDER: "closed_by_limit_order",
  CLOSED: "closed",
} as const;
export const TunaPositionStateSchema = z.enum([TunaPositionState.OPEN, ...Object.values(TunaPositionState)]);

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

export const TunaLpPositionFlagsSchema = z.object({
  lowerLimitOrderSwapToToken: z.nullable(TunaPositionPoolTokenSchema),
  upperLimitOrderSwapToToken: z.nullable(TunaPositionPoolTokenSchema),
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
  tickLowerIndex: z.number(),
  tickUpperIndex: z.number(),
  lowerLimitOrderPrice: z.number(),
  upperLimitOrderPrice: z.number(),
  entryPrice: z.number(),
  flags: TunaLpPositionFlagsSchema,
  mintA: Mint,
  mintB: Mint,
  pool: TunaPositionPoolSchema,
  marketMaker: PoolProviderSchema,
  depositedCollateralA: AmountWithUsdSchema,
  depositedCollateralB: AmountWithUsdSchema,
  leverage: z.number(),
  maxLeverage: z.number(),
  liquidationPriceLower: z.number(),
  liquidationPriceUpper: z.number(),
  initialDebtA: AmountWithUsdSchema,
  initialDebtB: AmountWithUsdSchema,
  currentDebtA: AmountWithUsdSchema,
  currentDebtB: AmountWithUsdSchema,
  leftoversA: AmountWithUsdSchema,
  leftoversB: AmountWithUsdSchema,
  yieldA: AmountWithUsdSchema,
  yieldB: AmountWithUsdSchema,
  compoundedYieldA: AmountWithUsdSchema,
  compoundedYieldB: AmountWithUsdSchema,
  totalA: AmountWithUsdSchema,
  totalB: AmountWithUsdSchema,
  pnlA: TokensPnlSchema,
  pnlB: TokensPnlSchema,
  pnlUsd: UsdPnlSchema,
  openedAt: z.coerce.date(),
  closedAt: z.nullable(z.coerce.date()),
});

export const TunaLpPositionHistorical = z.object({
  positionAddress: z.string(),
  authority: z.string(),
  pool: z.string(),
  state: TunaPositionStateSchema,
  lowerPrice: z.number(),
  upperPrice: z.number(),
  lowerLimitOrder: z.number().nullable(),
  upperLimitOrder: z.number().nullable(),
  marketMaker: PoolProviderSchema,
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullable(),
  totalValueUsd: z.number(),
  leverage: z.number(),
  initialLeverage: z.number(),
  totalDepositUsd: z.number(),
  totalWithdrawnUsd: z.number(),
  feesSumUsd: z.number(),
  closedPnlSumUsd: z.number(),
  entryPrice: z.number(),
  exitPrice: z.number().nullable(),
});

export const TunaPositionLegacy = z.object({
  address: z.string(),
  authority: z.string(),
  version: z.number(),
  state: TunaPositionStateSchema,
  positionMint: z.string(),
  liquidity: z.coerce.bigint(),
  tickLowerIndex: z.number(),
  tickUpperIndex: z.number(),
  entrySqrtPrice: z.coerce.bigint(),
  lowerLimitOrderSqrtPrice: z.coerce.bigint(),
  upperLimitOrderSqrtPrice: z.coerce.bigint(),
  flags: z.number(),
  pool: z.string(),
  poolSqrtPrice: z.coerce.bigint(),
  depositedCollateralA: AmountWithoutUsdSchema,
  depositedCollateralB: AmountWithoutUsdSchema,
  depositedCollateralUsd: z.object({
    amount: z.number(),
  }),
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
  pnlA: TokensPnlSchema,
  pnlB: TokensPnlSchema,
  pnlUsd: UsdPnlSchema,
  openedAt: z.coerce.date(),
  updatedAtSlot: z.coerce.bigint(),
  closedAt: z.nullable(z.coerce.date()),
});

export const TunaLpPositionParameters = z.object({
  lowerPrice: z.number(),
  upperPrice: z.number(),
  lowerLimitOrder: z.number().nullable(),
  upperLimitOrder: z.number().nullable(),
  lowerLimitOrderSwap: LpPositionLimitOrderSwapSchema,
  upperLimitOrderSwap: LpPositionLimitOrderSwapSchema,
  autoCompound: LpPositionAutoCompoundSchema,
  rebalance: LpPositionRebalanceSchema,
  rebalanceThresholdTicks: z.number(),
});

export const TunaLpPositionValue = z.object({
  totalValueA: z.number(),
  totalValueB: z.number(),
  totalValueUsd: z.number(),
  loanFundsA: z.number(),
  loanFundsB: z.number(),
  loanFundsUsd: z.number(),
  leverage: z.number(),
});

export const TunaLpPositionTransfer = z.object({
  amountA: z.number(),
  amountB: z.number(),
  amountUsd: z.number(),
});

export const TunaLpPositionTokenPrices = z.object({
  tokenPriceA: z.number(),
  tokenPriceB: z.number(),
});

export const TunaLpPositionActionOpen = z.object({
  parameters: TunaLpPositionParameters,
});

export const TunaLpPositionActionClose = z.object({
  toOwner: TunaLpPositionTransfer.nullable(),
  prices: TunaLpPositionTokenPrices.nullable(),
});

export const TunaLpPositionActionIncreaseLiquidity = z.object({
  fromPosition: TunaLpPositionValue.nullable(),
  toPosition: TunaLpPositionValue,
  fromOwner: TunaLpPositionTransfer,
  fromLending: TunaLpPositionTransfer,
  protocolFees: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionDecreaseLiquidity = z.object({
  withdrawPercent: z.number(),
  closedPnlUsd: z.number(),
  fromPosition: TunaLpPositionValue,
  toPosition: TunaLpPositionValue.nullable(),
  toOwner: TunaLpPositionTransfer,
  toLending: TunaLpPositionTransfer,
  collectedFees: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionLiquidate = z.object({
  withdrawPercent: z.number(),
  fromPosition: TunaLpPositionValue,
  toLending: TunaLpPositionTransfer,
  protocolFees: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionRepayDebt = z.object({
  fromPosition: TunaLpPositionValue,
  toPosition: TunaLpPositionValue,
  fromOwner: TunaLpPositionTransfer,
  toLending: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionCollectFees = z.object({
  closedPnlUsd: z.number(),
  position: TunaLpPositionValue,
  collectedFees: TunaLpPositionTransfer,
  toOwner: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionCollectAndCompoundFees = z.object({
  fromPosition: TunaLpPositionValue,
  toPosition: TunaLpPositionValue,
  collectedFees: TunaLpPositionTransfer,
  fromLending: TunaLpPositionTransfer,
  protocolFees: TunaLpPositionTransfer,
  prices: TunaLpPositionTokenPrices,
});

export const TunaLpPositionActionParametersUpdate = z.object({
  fromParameters: TunaLpPositionParameters,
  toParameters: TunaLpPositionParameters,
});

export const TunaLpPositionAction = z.object({
  action: LpPositionsActionTypeSchema,
  txSignature: z.string(),
  txTimestamp: z.coerce.date(),
  data: z.object({
    /** defined for: IncreaseLiquidity, DecreaseLiquidity, Liquidate, ExecuteLimitOrder, RepayDebt, CollectAndCompoundFees */
    fromPosition: TunaLpPositionValue.optional().nullable(),
    /** defined for: IncreaseLiquidity, DecreaseLiquidity, Liquidate, ExecuteLimitOrder, RepayDebt, CollectAndCompoundFees */
    toPosition: TunaLpPositionValue.optional().nullable(),
    /** defined for: CollectFees */
    position: TunaLpPositionValue.optional().nullable(),
    /** defined for: IncreaseLiquidity, RepayDebt */
    fromOwner: TunaLpPositionTransfer.optional(),
    /** defined for: DecreaseLiquidity, CollectFees, ClosePosition; nullable for: ClosePosition */
    toOwner: TunaLpPositionTransfer.optional().nullable(),
    /** defined for: IncreaseLiquidity, CollectAndCompoundFees */
    fromLending: TunaLpPositionTransfer.optional(),
    /** defined for: DecreaseLiquidity, Liquidate, ExecuteLimitOrder, RepayDebt */
    toLending: TunaLpPositionTransfer.optional(),
    /** defined for: CollectFees, CollectAndCompoundFees */
    collectedFees: TunaLpPositionTransfer.optional(),
    /** defined for: IncreaseLiquidity, Liquidate, ExecuteLimitOrder, CollectAndCompoundFees */
    protocolFees: TunaLpPositionTransfer.optional(),
    /** defined for: IncreaseLiquidity, DecreaseLiquidity, Liquidate, ExecuteLimitOrder, RepayDebt, CollectFees, CollectAndCompoundFees, ClosePosition; nullable for: ClosePosition */
    prices: TunaLpPositionTokenPrices.optional().nullable(),
    /** defined for: OpenPosition */
    parameters: TunaLpPositionParameters.optional(),
    /** defined for: ParametersUpdate */
    fromParameters: TunaLpPositionParameters.optional(),
    /** defined for: ParametersUpdate */
    toParameters: TunaLpPositionParameters.optional(),
    /** defined for: DecreaseLiquidity */
    withdrawPercent: z.number().optional(),
    /** defined for: DecreaseLiquidity, CollectFees */
    closedPnlUsd: z.number().optional(),
  }),
});
