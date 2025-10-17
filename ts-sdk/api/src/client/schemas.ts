import { z } from "zod";

const amountWithoutUsd = z.object({
  amount: z.coerce.bigint(),
});

const amountWithUsd = z.object({
  amount: z.coerce.bigint(),
  usd: z.number(),
});

const tokensPnl = z.object({
  amount: z.coerce.bigint(),
  bps: z.number(),
});

const usdPnl = z.object({
  amount: z.number(),
  bps: z.number(),
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
} as const;
export const NotificationAction = {
  CREATE: "create",
  UPDATE: "update",
} as const;
export const PoolProvider = {
  ORCA: "orca",
  FUSION: "fusion",
} as const;
export const TunaPositionState = {
  OPEN: "open",
  LIQUIDATED: "liquidated",
  CLOSED_BY_LIMIT_ORDER: "closed_by_limit_order",
  CLOSED: "closed",
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
} as const;

export const NotificationEntitySchema = z.enum([NotificationEntity.POOL_SWAP, ...Object.values(NotificationEntity)]);
export const NotificationActionSchema = z.enum([NotificationAction.CREATE, ...Object.values(NotificationAction)]);
export const PoolProviderSchema = z.enum([PoolProvider.ORCA, ...Object.values(PoolProvider)]);
export const TunaPositionStateSchema = z.enum([TunaPositionState.OPEN, ...Object.values(TunaPositionState)]);
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
  borrowedFundsA: amountWithUsd,
  borrowedFundsB: amountWithUsd,
  availableBorrowA: amountWithUsd,
  availableBorrowB: amountWithUsd,
  borrowLimitA: amountWithUsd,
  borrowLimitB: amountWithUsd,
  disabled: z.boolean(),
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
  depositedFunds: amountWithUsd,
  borrowedFunds: amountWithUsd,
  supplyLimit: amountWithUsd,
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
  supply: amountWithUsd,
  borrow: amountWithUsd,
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
  funds: amountWithUsd,
  earned: amountWithUsd,
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
  /**
   * @deprecated Use entrySqrtPrice
   */
  tickEntryIndex: z.number(),
  /**
   * @deprecated Use lowerLimitOrderSqrtPrice
   */
  tickStopLossIndex: z.number(),
  /**
   * @deprecated Use upperLimitOrderSqrtPrice
   */
  tickTakeProfitIndex: z.number(),
  entrySqrtPrice: z.coerce.bigint(),
  lowerLimitOrderSqrtPrice: z.coerce.bigint(),
  upperLimitOrderSqrtPrice: z.coerce.bigint(),
  swapToTokenOnLimitOrder: z.number(),
  flags: z.number(),
  pool: z.string(),
  poolSqrtPrice: z.coerce.bigint(),
  depositedCollateralA: amountWithoutUsd,
  depositedCollateralB: amountWithoutUsd,
  depositedCollateralUsd: z.object({
    amount: z.number(),
  }),
  loanFundsA: amountWithUsd,
  loanFundsB: amountWithUsd,
  currentLoanA: amountWithUsd,
  currentLoanB: amountWithUsd,
  leftoversA: amountWithUsd,
  leftoversB: amountWithUsd,
  yieldA: amountWithUsd,
  yieldB: amountWithUsd,
  compoundedYieldA: amountWithUsd,
  compoundedYieldB: amountWithUsd,
  totalA: amountWithUsd,
  totalB: amountWithUsd,
  pnlA: tokensPnl,
  pnlB: tokensPnl,
  pnlUsd: usdPnl,
  openedAt: z.coerce.date(),
  updatedAtSlot: z.coerce.bigint(),
  closedAt: z.nullable(z.coerce.date()),
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
  collateral: amountWithUsd,
  loanFunds: amountWithUsd,
  currentLoan: amountWithUsd,
  total: amountWithUsd,
  pnlUsd: usdPnl,
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
  amountIn: amountWithUsd,
  amountOut: amountWithUsd,
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
  baseToken: amountWithUsd,
  quoteToken: amountWithUsd,
  fee: amountWithUsd,
  pnl: z.nullable(usdPnl),
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
  totalStaked: amountWithUsd,
  totalReward: amountWithUsd,
  unstakeCooldownSeconds: z.number(),
  isStakingEnabled: z.boolean(),
  isUnstakingEnabled: z.boolean(),
  isWithdrawEnabled: z.boolean(),
});

export const StakingPosition = z.object({
  address: z.string(),
  owner: z.string(),
  staked: amountWithUsd,
  unstaked: amountWithUsd,
  claimedReward: amountWithUsd,
  unclaimedReward: amountWithUsd,
  rank: z.nullable(z.number()),
  vesting: z.object({
    locked: amountWithUsd,
    unlocked: amountWithUsd,
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
  staked: amountWithUsd,
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
    authority: z.nullable(z.string()),
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
export const StakingPositionNotification = createNotificationSchema(StakingPosition);
