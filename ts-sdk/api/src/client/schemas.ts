import { z } from "zod";

import { AmountWithUsdSchema, PoolProviderSchema, TokensPnlSchema, UsdPnlSchema } from "./schemas/basic";
import { TunaPositionStateSchema } from "./schemas/lp_positions.ts";

export * from "./schemas/basic";
export * from "./schemas/lp_positions";

const amountWithoutUsd = z.object({
  amount: z.coerce.bigint(),
});

export const NotificationEntity = {
  POOL_SWAP: "pool_swap",
  POOL_PRICE: "pool_price",
  ORDER_BOOK: "order_book",
  TUNA_POSITION: "tuna_position",
  TUNA_SPOT_POSITION: "tuna_spot_position",
  LENDING_POSITION: "lending_position",
  STAKING_POSITION: "staking_position",
  FUSION_LIMIT_ORDER: "fusion_limit_order",
  TRADE_HISTORY_ENTRY: "trade_history_entry",
  ORDER_HISTORY_ENTRY: "order_history_entry",
  STATE_SNAPSHOT: "state_snapshot",
} as const;
export const NotificationAction = {
  CREATE: "create",
  UPDATE: "update",
} as const;

export const TunaSpotPositionState = {
  OPEN: "open",
  CLOSED: "closed",
} as const;
export const LimitOrderState = {
  OPEN: "open",
  PARTIALLY_FILLED: "partially_filled",
  FILLED: "filled",
  COMPLETE: "complete",
  CANCELLED: "cancelled",
} as const;
export const TradeHistoryAction = {
  SWAP: "swap",
  LIMIT_ORDER_FILL: "limit_order_fill",
  POSITION_INCREASE: "position_increase",
  POSITION_DECREASE: "position_decrease",
  TAKE_PROFIT: "take_profit",
  STOP_LOSS: "stop_loss",
  LIQUIDATION: "liquidation",
} as const;
export const TradeHistoryUIDirection = {
  BUY: "buy",
  SELL: "sell",
  OPEN_LONG: "open_long",
  CLOSE_LONG: "close_long",
  OPEN_SHORT: "open_short",
  CLOSE_SHORT: "close_short",
} as const;
export const OrderHistoryOrderType = {
  MARKET: "market",
  LIMIT: "limit",
  TAKE_PROFIT_MARKET: "take_profit_market",
  STOP_LOSS_MARKET: "stop_loss_market",
  LIQUIDATION_MARKET: "liquidation_market",
} as const;
export const OrderHistoryStatus = {
  OPEN: "open",
  PARTIALLY_FILLED: "partially_filled",
  FILLED: "filled",
  CANCELLED: "cancelled",
  CLAIMED: "claimed",
  REJECTED: "rejected",
} as const;
export const OrderHistoryUIDirection = {
  BUY: "buy",
  SELL: "sell",
  LONG: "long",
  SHORT: "short",
} as const;
export const StakingPositionHistoryActionType = {
  STAKE: "stake",
  UNSTAKE: "unstake",
  WITHDRAW: "withdraw",
  CLAIM_REWARDS: "claim_rewards",
  COMPOUND_REWARDS: "compound_rewards",
} as const;
export const PoolSubscriptionTopic = {
  ORDER_BOOK: "order_book",
  POOL_PRICES: "pool_prices",
  POOL_SWAPS: "pool_swaps",
} as const;
export const WalletSubscriptionTopic = {
  TUNA_POSITIONS: "tuna_positions",
  TUNA_SPOT_POSITIONS: "tuna_spot_positions",
  LENDING_POSITIONS: "lending_positions",
  FUSION_LIMIT_ORDERS: "fusion_limit_orders",
  STAKING_POSITION: "staking_position",
  TRADE_HISTORY: "trade_history",
  ORDER_HISTORY: "order_history",
} as const;
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

export const NotificationEntitySchema = z.enum([NotificationEntity.POOL_SWAP, ...Object.values(NotificationEntity)]);
export const NotificationActionSchema = z.enum([NotificationAction.CREATE, ...Object.values(NotificationAction)]);

export const TunaSpotPositionStateSchema = z.enum([
  TunaSpotPositionState.OPEN,
  ...Object.values(TunaSpotPositionState),
]);
export const LimitOrderStateSchema = z.enum([LimitOrderState.OPEN, ...Object.values(LimitOrderState)]);
export const TradeHistoryActionSchema = z.enum([TradeHistoryAction.SWAP, ...Object.values(TradeHistoryAction)]);
export const TradeHistoryUIDirectionSchema = z.enum([
  TradeHistoryUIDirection.BUY,
  ...Object.values(TradeHistoryUIDirection),
]);
export const OrderHistoryOrderTypeSchema = z.enum([
  OrderHistoryOrderType.MARKET,
  ...Object.values(OrderHistoryOrderType),
]);
export const OrderHistoryStatusSchema = z.enum([OrderHistoryStatus.OPEN, ...Object.values(OrderHistoryStatus)]);
export const OrderHistoryUIDirectionSchema = z.enum([
  OrderHistoryUIDirection.BUY,
  ...Object.values(OrderHistoryUIDirection),
]);
export const StakingPositionHistoryActionTypeSchema = z.enum([
  StakingPositionHistoryActionType.STAKE,
  ...Object.values(StakingPositionHistoryActionType),
]);
export const PoolSubscriptionTopicSchema = z.enum([
  PoolSubscriptionTopic.ORDER_BOOK,
  ...Object.values(PoolSubscriptionTopic),
]);
export const WalletSubscriptionTopicSchema = z.enum([
  WalletSubscriptionTopic.TUNA_POSITIONS,
  ...Object.values(WalletSubscriptionTopic),
]);
export const LpPositionLimitOrderSwapSchema = z.enum(Object.values(LpPositionLimitOrderSwap) as [string, ...string[]]);
export const LpPositionAutoCompoundSchema = z.enum(Object.values(LpPositionAutoCompound) as [string, ...string[]]);
export const LpPositionRebalanceSchema = z.enum(Object.values(LpPositionRebalance) as [string, ...string[]]);
export const LpPositionsActionTypeSchema = z.enum(Object.values(LpPositionsActionType) as [string, ...string[]]);
export const PaginationMeta = z.object({
  total: z.number(),
});

export const Mint = z.object({
  symbol: z.string(),
  mint: z.string(),
  logo: z.string(),
  decimals: z.number(),
});

export const Market = z.object({
  address: z.string(),
  addressLookupTable: z.string(),
  poolAddress: z.string(),
  poolFeeRate: z.number(),
  provider: PoolProviderSchema,
  maxLeverage: z.number(),
  maxSwapSlippage: z.number(),
  protocolFee: z.number(),
  rebalanceProtocolFee: z.number(),
  protocolFeeOnCollateral: z.number(),
  liquidationFee: z.number(),
  liquidationThreshold: z.number(),
  oraclePriceDeviationThreshold: z.number(),
  limitOrderExecutionFee: z.number(),
  maxSpotPositionSizeA: AmountWithUsdSchema,
  maxSpotPositionSizeB: AmountWithUsdSchema,
  borrowedFundsA: AmountWithUsdSchema,
  borrowedFundsB: AmountWithUsdSchema,
  availableBorrowA: AmountWithUsdSchema,
  availableBorrowB: AmountWithUsdSchema,
  borrowLimitA: AmountWithUsdSchema,
  borrowLimitB: AmountWithUsdSchema,
  disabled: z.boolean(),
  createdAt: z.coerce.date(),
});

export const TokenOraclePrice = z.object({
  mint: z.string(),
  price: z.coerce.bigint(),
  decimals: z.number(),
  time: z.coerce.date(),
});

export const Vault = z.object({
  address: z.string(),
  mint: z.string(),
  depositedFunds: AmountWithUsdSchema,
  borrowedFunds: AmountWithUsdSchema,
  supplyLimit: AmountWithUsdSchema,
  borrowedShares: z.coerce.bigint(),
  depositedShares: z.coerce.bigint(),
  supplyApy: z.number(),
  borrowApy: z.number(),
  interestRate: z.coerce.bigint(),
  utilization: z.number(),
  pythOracleFeedId: z.string(),
  pythOraclePriceUpdate: z.string(),
});

export const VaultHistoricalStats = z.object({
  date: z.preprocess((val, ctx) => {
    if (typeof val === "string") {
      const [year, month, day] = val.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    ctx.addIssue({
      code: "custom",
      message: "Not a valid date string",
    });

    return z.NEVER;
  }, z.date()),
  supply: AmountWithUsdSchema,
  borrow: AmountWithUsdSchema,
  supplyApy: z.number(),
  borrowApr: z.number(),
});

export const Pool = z.object({
  address: z.string(),
  provider: PoolProviderSchema,
  tokenAMint: z.string(),
  tokenBMint: z.string(),
  tokenAVault: z.string(),
  tokenBVault: z.string(),
  tvlUsdc: z.coerce.number(),
  priceChange24H: z.number(),
  tickSpacing: z.number(),
  feeRate: z.number(),
  olpFeeRate: z.nullable(z.number()),
  protocolFeeRate: z.number(),
  liquidity: z.coerce.bigint(),
  sqrtPrice: z.coerce.bigint(),
  tickCurrentIndex: z.number(),
  stats: z.object({
    "24h": z.object({
      volume: z.coerce.number(),
      fees: z.coerce.number(),
      rewards: z.coerce.number(),
      yieldOverTvl: z.coerce.number(),
    }),
    "7d": z.object({
      volume: z.coerce.number(),
      fees: z.coerce.number(),
      rewards: z.coerce.number(),
      yieldOverTvl: z.coerce.number(),
    }),
    "30d": z.object({
      volume: z.coerce.number(),
      fees: z.coerce.number(),
      rewards: z.coerce.number(),
      yieldOverTvl: z.coerce.number(),
    }),
  }),
});

export const Tick = z.object({
  index: z.number(),
  liquidity: z.coerce.bigint(),
});

export const PoolTicks = z.object({
  tickSpacing: z.number(),
  ticks: Tick.array(),
});

export const LendingPosition = z.object({
  address: z.string(),
  authority: z.string(),
  mint: z.string(),
  vault: z.string(),
  shares: z.coerce.bigint(),
  funds: AmountWithUsdSchema,
  earned: AmountWithUsdSchema,
});

export const TunaPosition = z.object({
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
  depositedCollateralA: amountWithoutUsd,
  depositedCollateralB: amountWithoutUsd,
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

export const TunaLpPosition = z.object({
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

export const TunaSpotPosition = z.object({
  address: z.string(),
  authority: z.string(),
  version: z.number(),
  state: TunaSpotPositionStateSchema,
  entrySqrtPrice: z.coerce.bigint(),
  lowerLimitOrderSqrtPrice: z.coerce.bigint(),
  upperLimitOrderSqrtPrice: z.coerce.bigint(),
  flags: z.number(),
  pool: z.string(),
  poolSqrtPrice: z.coerce.bigint(),
  collateralToken: z.string(),
  borrowToken: z.string(),
  positionToken: z.string(),
  collateral: AmountWithUsdSchema,
  loanFunds: AmountWithUsdSchema,
  currentLoan: AmountWithUsdSchema,
  total: AmountWithUsdSchema,
  uiLiquidationPrice: z.nullable(z.number()),
  pnlUsd: UsdPnlSchema,
  leverage: z.number(),
  openedAt: z.coerce.date(),
  openedAtSlot: z.coerce.bigint(),
  updatedAtSlot: z.coerce.bigint(),
  closedAt: z.nullable(z.coerce.date()),
});

export const PoolSwap = z.object({
  id: z.string(),
  amountIn: z.coerce.bigint(),
  amountOut: z.coerce.bigint(),
  amountUsd: z.number(),
  aToB: z.boolean(),
  pool: z.string(),
  time: z.coerce.date(),
});

export const OrderBookEntry = z.object({
  concentratedAmount: z.coerce.bigint(),
  concentratedAmountQuote: z.coerce.bigint(),
  concentratedTotal: z.coerce.bigint(),
  concentratedTotalQuote: z.coerce.bigint(),
  limitAmount: z.coerce.bigint(),
  limitAmountQuote: z.coerce.bigint(),
  limitTotal: z.coerce.bigint(),
  limitTotalQuote: z.coerce.bigint(),
  price: z.number(),
  askSide: z.boolean(),
});

export const PoolPriceUpdate = z.object({
  pool: z.string(),
  price: z.number(),
  sqrtPrice: z.coerce.bigint(),
  time: z.coerce.date(),
});

export const OrderBook = z.object({
  entries: OrderBookEntry.array(),
  poolPrice: z.number(),
});

export const LimitOrder = z.object({
  address: z.string(),
  mint: z.string(),
  pool: z.string(),
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

export const TradeHistoryEntry = z.object({
  // Internal entry ID
  id: z.string(),
  pool: z.string(),
  authority: z.string(),
  aToB: z.boolean(),
  // Trade action which created entry
  action: TradeHistoryActionSchema,
  // Trade direction formatted for ui display
  uiDirection: TradeHistoryUIDirectionSchema,
  // Trade price formatted for ui display
  uiPrice: z.number(),
  baseToken: AmountWithUsdSchema,
  quoteToken: AmountWithUsdSchema,
  fee: AmountWithUsdSchema,
  pnl: z.nullable(
    z.object({
      usd: z.number(),
      bps: z.number(),
    }),
  ),
  txSignature: z.nullable(z.string()),
  positionAddress: z.nullable(z.string()),
  slot: z.coerce.bigint(),
  ts: z.coerce.date(),
});

export const OrderHistoryEntry = z.object({
  // Internal entry ID
  id: z.string(),
  pool: z.string(),
  authority: z.string(),
  orderType: OrderHistoryOrderTypeSchema,
  isReduceOnly: z.nullable(z.boolean()),
  aToB: z.boolean(),
  uiDirection: OrderHistoryUIDirectionSchema,
  uiPrice: z.nullable(z.number()),
  uiExecutionPrice: z.nullable(z.number()),
  status: OrderHistoryStatusSchema,
  baseToken: AmountWithUsdSchema,
  quoteToken: AmountWithUsdSchema,
  baseTokenConsumedAmount: z.nullable(AmountWithUsdSchema),
  quoteTokenFilledAmount: z.nullable(AmountWithUsdSchema),
  txSignature: z.nullable(z.string()),
  positionAddress: z.nullable(z.string()),
  slot: z.coerce.bigint(),
  ts: z.coerce.date(),
});

export const StakingTreasury = z.object({
  address: z.string(),
  stakedTokenMint: z.string(),
  rewardTokenMint: z.string(),
  apy: z.number(),
  uniqueStakers: z.number(),
  totalStaked: AmountWithUsdSchema,
  totalReward: AmountWithUsdSchema,
  unstakeCooldownSeconds: z.number(),
  isStakingEnabled: z.boolean(),
  isUnstakingEnabled: z.boolean(),
  isWithdrawEnabled: z.boolean(),
});

export const StakingPosition = z.object({
  address: z.string(),
  owner: z.string(),
  staked: AmountWithUsdSchema,
  unstaked: AmountWithUsdSchema,
  claimedReward: AmountWithUsdSchema,
  unclaimedReward: AmountWithUsdSchema,
  rank: z.nullable(z.number()),
  vesting: z.object({
    locked: AmountWithUsdSchema,
    unlocked: AmountWithUsdSchema,
    unlockRate: z.coerce.bigint(),
    unlockEverySeconds: z.number(),
    unlockCliffSeconds: z.number(),
    lockedAt: z.nullable(z.coerce.date()),
  }),
  lastUnstakedAt: z.nullable(z.coerce.date()),
  withdrawAvailableAt: z.nullable(z.coerce.date()),
});

export const StakingLeaderboardPosition = z.object({
  rank: z.number(),
  address: z.string(),
  owner: z.string(),
  staked: AmountWithUsdSchema,
});

export const StakingLeaderboardPage = z.object({
  data: StakingLeaderboardPosition.array(),
  meta: PaginationMeta,
});

export const StakingPositionHistoryAction = z.object({
  position: z.string(),
  action: StakingPositionHistoryActionTypeSchema,
  txSignature: z.string(),
  amount: z.coerce.bigint(),
  time: z.coerce.date(),
});

export const PoolPriceCandle = z.object({
  time: z.number(),
  open: z.number(),
  close: z.number(),
  high: z.number(),
  low: z.number(),
  volume: z.number(),
});

export const FeesStatsGroup = z.object({
  time: z.coerce.date(),
  addLiquidityFees: z.number(),
  limitOrderFees: z.number(),
  yieldCompoundingFees: z.number(),
  liquidationFees: z.number(),
  totalLiquidationsNetworkFees: z.number(),
  totalLimitOrdersNetworkFees: z.number(),
  totalYieldCompoundingNetworkFees: z.number(),
  failedNetworkFees: z.number(),
  processedNetworkFees: z.number(),
  totalCollectedFees: z.number(),
  totalNetworkFees: z.number(),
  jitoLiquidationFees: z.number(),
  jitoLimitOrderFees: z.number(),
  jitoYieldCompoundingFees: z.number(),
  runningAddLiquidityFees: z.number(),
  runningLimitOrderFees: z.number(),
  runningYieldCompoundingFees: z.number(),
  runningLiquidationFees: z.number(),
  runningTotalLiquidationsNetworkFees: z.number(),
  runningTotalLimitOrdersNetworkFees: z.number(),
  runningTotalYieldCompoundingNetworkFees: z.number(),
  runningFailedNetworkFees: z.number(),
  runningProcessedNetworkFees: z.number(),
  runningJitoLiquidationFees: z.number(),
  runningJitoLimitOrderFees: z.number(),
  runningJitoYieldCompoundingFees: z.number(),
  runningTotalCollectedFees: z.number(),
  runningTotalNetworkFees: z.number(),
});

export const StakingRevenueStatsGroup = z.object({
  time: z.coerce.date(),
  totalDepositsUsd: z.number(),
  totalDepositsSol: z.coerce.bigint(),
  runningTotalDepositsUsd: z.number(),
  runningTotalDepositsSol: z.coerce.bigint(),
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
  uiLiquidationPrice: z.nullable(z.number()),
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
  uiLiquidationPrice: z.nullable(z.number()),
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

export const SwapQuoteByInput = z.object({
  estimatedAmountOut: z.coerce.bigint(),
  minAmountOut: z.coerce.bigint(),
  feeAmount: z.coerce.bigint(),
  feeUsd: z.number(),
  /** Price impact in percents */
  priceImpact: z.number(),
});

export const SwapQuoteByOutput = z.object({
  estimatedAmountIn: z.coerce.bigint(),
  maxAmountIn: z.coerce.bigint(),
  feeAmount: z.coerce.bigint(),
  feeUsd: z.number(),
  /** Price impact in percents */
  priceImpact: z.number(),
});

export const StateSnapshot = z.object({
  slot: z.coerce.bigint(),
  blockTime: z.coerce.date(),
  poolPrices: z.optional(z.record(z.string(), PoolPriceUpdate)),
  tunaSpotPositions: z.optional(z.array(TunaSpotPosition)),
  tunaLpPositions: z.optional(z.array(TunaPosition)),
  fusionLimitOrders: z.optional(z.array(LimitOrder)),
});

export const LimitOrderQuoteByInput = z.object({
  amountOut: z.coerce.bigint(),
});

export const LimitOrderQuoteByOutput = z.object({
  amountIn: z.coerce.bigint(),
});

export const TradableAmount = AmountWithUsdSchema;

export const UpdateStreamSubscriptionResult = z.object({
  status: z.string(),
});

const createNotificationSchema = <DataType extends z.ZodTypeAny, MetaType extends z.ZodTypeAny>(
  dataSchema: DataType,
  metaSchema?: MetaType,
) =>
  z.object({
    entity: NotificationEntitySchema,
    action: NotificationActionSchema,
    data: dataSchema,
    id: z.string(),
    authority: z.nullish(z.string()),
    ...(metaSchema ? { meta: metaSchema } : { meta: z.undefined().nullable() }),
  });

export const OrderBookNotificationMeta = z.object({
  pool: z.string(),
  priceStep: z.number(),
  inverted: z.boolean(),
});

export const PoolSwapNotification = createNotificationSchema(PoolSwap);
export const PoolPriceUpdateNotification = createNotificationSchema(PoolPriceUpdate);
export const OrderBookNotification = createNotificationSchema(OrderBook, OrderBookNotificationMeta);
export const TunaPositionNotification = createNotificationSchema(TunaPosition);
export const TunaSpotPositionNotification = createNotificationSchema(TunaSpotPosition);
export const LendingPositionNotification = createNotificationSchema(LendingPosition);
export const LimitOrderNotification = createNotificationSchema(LimitOrder);
export const TradeHistoryEntryNotification = createNotificationSchema(TradeHistoryEntry);
export const OrderHistoryEntryNotification = createNotificationSchema(OrderHistoryEntry);
export const StakingPositionNotification = createNotificationSchema(StakingPosition);
export const StateSnapshotNotification = createNotificationSchema(StateSnapshot);
