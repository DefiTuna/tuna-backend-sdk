import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import { z } from "zod";

import * as schemas from "./schemas";
import { NotificationAction, NotificationEntity, PoolProvider, TunaPositionState } from "./schemas";

/* Export schemas for raw data handling */
export { schemas };

/* Enums */
export { PoolProvider, TunaPositionState, NotificationAction, NotificationEntity };
export type PoolProviderType = z.infer<typeof schemas.PoolProviderSchema>;
export type TunaPositionStateType = z.infer<typeof schemas.TunaPositionStateSchema>;
export type TunaSpotPositionStateType = z.infer<typeof schemas.TunaSpotPositionStateSchema>;
export type LimitOrderStateType = z.infer<typeof schemas.LimitOrderStateSchema>;
export type TradeHistoryActionType = z.infer<typeof schemas.TradeHistoryActionSchema>;
export type TradeHistoryUIDirectionType = z.infer<typeof schemas.TradeHistoryUIDirectionSchema>;
export type OrderHistoryOrderTypeType = z.infer<typeof schemas.OrderHistoryOrderTypeSchema>;
export type OrderHistoryStatusType = z.infer<typeof schemas.OrderHistoryStatusSchema>;
export type OrderHistoryUIDirectionType = z.infer<typeof schemas.OrderHistoryUIDirectionSchema>;
export type StakingPositionHistoryActionType = z.infer<typeof schemas.StakingPositionHistoryActionTypeSchema>;
export type PoolSubscriptionTopicType = z.infer<typeof schemas.PoolSubscriptionTopicSchema>;
export type WalletSubscriptionTopicType = z.infer<typeof schemas.WalletSubscriptionTopicSchema>;
export type PaginationMeta = z.infer<typeof schemas.PaginationMeta>;

/* Entity types */
export type Mint = z.infer<typeof schemas.Mint>;
export type Market = z.infer<typeof schemas.Market>;
export type TokenOraclePrice = z.infer<typeof schemas.TokenOraclePrice>;
export type Vault = z.infer<typeof schemas.Vault>;
export type VaultHistoricalStats = z.infer<typeof schemas.VaultHistoricalStats>;
export type Pool = z.infer<typeof schemas.Pool>;
export type Tick = z.infer<typeof schemas.Tick>;
export type PoolTicks = z.infer<typeof schemas.PoolTicks>;
export type PoolSwap = z.infer<typeof schemas.PoolSwap>;
export type OrderBookEntry = z.infer<typeof schemas.OrderBookEntry>;
export type OrderBook = z.infer<typeof schemas.OrderBook>;
export type LendingPosition = z.infer<typeof schemas.LendingPosition>;
export type TunaPosition = z.infer<typeof schemas.TunaPosition>;
export type TunaSpotPosition = z.infer<typeof schemas.TunaSpotPosition>;
export type LimitOrder = z.infer<typeof schemas.LimitOrder>;
export type TradeHistoryEntry = z.infer<typeof schemas.TradeHistoryEntry>;
export type OrderHistoryEntry = z.infer<typeof schemas.OrderHistoryEntry>;
export type StakingPosition = z.infer<typeof schemas.StakingPosition>;
export type StakingTreasury = z.infer<typeof schemas.StakingTreasury>;
export type StakingLeaderboardPage = z.infer<typeof schemas.StakingLeaderboardPage>;
export type StakingLeaderboardPosition = z.infer<typeof schemas.StakingLeaderboardPosition>;
export type StakingPositionHistoryAction = z.infer<typeof schemas.StakingPositionHistoryAction>;
export type PoolPriceCandle = z.infer<typeof schemas.PoolPriceCandle>;
export type FeesStatsGroup = z.infer<typeof schemas.FeesStatsGroup>;
export type StakingRevenueStatsGroup = z.infer<typeof schemas.StakingRevenueStatsGroup>;
export type LimitOrderQuoteByInput = z.infer<typeof schemas.LimitOrderQuoteByInput>;
export type LimitOrderQuoteByOutput = z.infer<typeof schemas.LimitOrderQuoteByOutput>;
export type SwapQuoteByInput = z.infer<typeof schemas.SwapQuoteByInput>;
export type SwapQuoteByOutput = z.infer<typeof schemas.SwapQuoteByOutput>;
export type IncreaseSpotPositionQuote = z.infer<typeof schemas.IncreaseSpotPositionQuote>;
export type DecreaseSpotPositionQuote = z.infer<typeof schemas.DecreaseSpotPositionQuote>;
export type CloseSpotPositionQuote = z.infer<typeof schemas.CloseSpotPositionQuote>;
export type TradableAmount = z.infer<typeof schemas.TradableAmount>;
export type PoolPriceUpdate = z.infer<typeof schemas.PoolPriceUpdate>;
export type StateSnapshot = z.infer<typeof schemas.StateSnapshot>;

/* Request payloads */
export type SubscriptionPayload = {
  pools?: {
    address: string;
    topics: PoolSubscriptionTopicType[];
    orderBookPriceStep?: number;
    isInverted?: boolean;
  }[];
  wallet?: {
    address: string;
    topics: WalletSubscriptionTopicType[];
  };
};

/* Args */

export type GetLimitOrderQuoteByInputArgs = {
  pool: string;
  amountIn: bigint;
  aToB: boolean;
  tickIndex: number;
};

export type GetLimitOrderQuoteByOutputArgs = {
  pool: string;
  amountOut: bigint;
  aToB: boolean;
  tickIndex: number;
};

export type GetSwapQuoteByInputArgs = {
  pool: string;
  amountIn: bigint;
  aToB: boolean;
  slippageToleranceBps?: number;
};

export type GetSwapQuoteByOutputArgs = {
  pool: string;
  amountOut: bigint;
  aToB: boolean;
  slippageToleranceBps?: number;
};

export type GetIncreaseSpotPositionQuoteArgs = {
  market: string;
  increaseAmount: bigint;
  collateralToken: number;
  positionToken: number;
  leverage: number;
  positionAmount?: bigint;
  positionDebt?: bigint;
  slippageTolerance?: number;
};

export type GetDecreaseSpotPositionQuoteArgs = {
  market: string;
  decreaseAmount: bigint;
  collateralToken: number;
  positionToken: number;
  leverage: number;
  positionAmount: bigint;
  positionDebt: bigint;
  slippageTolerance?: number;
};

export type GetCloseSpotPositionQuoteArgs = {
  market: string;
  decreasePercent: number;
  collateralToken: number;
  positionToken: number;
  positionAmount: bigint;
  positionDebt: bigint;
  slippageTolerance?: number;
};

export type GetTradableAmountArgs = {
  market: string;
  collateralToken: number;
  positionToken: number;
  availableBalance: bigint;
  leverage: number;
  positionAmount: bigint;
  increase: boolean;
};

/* Filters */

export type GetUserLimitOrdersOptions = {
  pool?: string[];
  status?: LimitOrderStateType[];
  openedAt?: {
    from?: Date;
    to?: Date;
  };
  cursor?: string;
  limit?: number;
  desc?: boolean;
};

export type GetUserTradeHistoryOptions = {
  pool?: string[];
  action?: TradeHistoryActionType[];
  uiDirection?: TradeHistoryUIDirectionType[];
  cursor?: string;
  limit?: number;
  desc?: boolean;
};

export type GetUserOrderHistoryOptions = {
  pool?: string[];
  orderType?: OrderHistoryOrderTypeType[];
  uiDiretion?: OrderHistoryUIDirectionType[];
  cursor?: string;
  limit?: number;
  desc?: boolean;
};

/* Client configuration */
export type DurationInMs = number;

const DEFAULT_TIMEOUT: DurationInMs = 5000;
const DEFAULT_HTTP_RETRIES = 3;

export enum ProviderFilter {
  ORCA = "orca",
  FUSION = "fusion",
  ALL = "all",
}

export type GetPoolPriceCandlesOptions = {
  from: Date;
  to: Date;
  candles: number;
  /* Interval string like 5s, 5m, 1d */
  interval: string;
};

export type TunaApiClientConfig = {
  /** Backend API URL */
  baseURL: string;
  /** Timeout of each request (for all of retries). Default: 5000ms */
  timeout?: DurationInMs;
  /**
   * Number of times a HTTP request will be retried before the API returns a failure. Default: 3.
   *
   * The connection uses exponential back-off for the delay between retries. However,
   * it will timeout regardless of the retries at the configured `timeout` time.
   */
  httpRetries?: number;
  /**
   * Optional headers to be included in every request.
   */
  headers?: HeadersInit;
};

type QueryParams = Record<string, string | number | boolean | undefined>;

/* API Client */
export class TunaApiClient {
  private _baseURL: string;
  get baseURL(): string {
    return this._baseURL;
  }

  private _timeout: DurationInMs;
  get timeout(): DurationInMs {
    return this._timeout;
  }

  private _httpRetries: number;
  get httpRetries(): number {
    return this._httpRetries;
  }

  private _headers: HeadersInit;
  get headers(): HeadersInit {
    return this._headers;
  }

  constructor(baseURL: string, config?: Partial<Omit<TunaApiClientConfig, "baseURL">>) {
    this._baseURL = baseURL;
    this._timeout = config?.timeout ?? DEFAULT_TIMEOUT;
    this._httpRetries = config?.httpRetries ?? DEFAULT_HTTP_RETRIES;
    this._headers = config?.headers ?? {};
  }

  setConfig(config: Partial<TunaApiClientConfig>) {
    if (config.baseURL) {
      this._baseURL = config.baseURL;
    }

    this._timeout = config?.timeout ?? DEFAULT_TIMEOUT;
    this._httpRetries = config?.httpRetries ?? DEFAULT_HTTP_RETRIES;
    this._headers = config?.headers ?? {};
  }

  private async httpRequest<ResponseData>(
    url: string,
    schema: z.ZodSchema<ResponseData>,
    options?: RequestInit & { parseRoot?: boolean },
    retries = this.httpRetries,
    backoff = 100 + Math.floor(Math.random() * 100), // Adding randomness to the initial backoff to avoid "thundering herd" scenario where a lot of clients that get kicked off all at the same time (say some script or something) and fail to connect all retry at exactly the same time too
  ): Promise<ResponseData> {
    try {
      const controller = new AbortController();

      const abort = setTimeout(() => {
        controller.abort();
      }, this.timeout);
      const signal: AbortSignal = options?.signal || controller.signal;

      const response = await fetch(url, {
        ...options,
        signal,
        headers: { "Content-Type": "application/json", ...this.headers, ...options?.headers },
      });
      clearTimeout(abort);
      if (!response.ok) {
        const errorBody = await response.json();
        throw errorBody;
      }
      const data = await response.json();
      const transformed = camelcaseKeys(data, { deep: true, exclude: ["24h", "7d", "30d"] });
      if (options?.parseRoot) {
        return schema.parse(transformed);
      }

      return schema.parse(transformed.data);
    } catch (error) {
      if (retries > 0 && !(error instanceof Error && error.name === "AbortError")) {
        // Wait for a backoff period before retrying
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.httpRequest(url, schema, options, retries - 1, backoff * 2); // Exponential backoff
      }
      throw error;
    }
  }

  /* Endpoints */
  async getMints(): Promise<Mint[]> {
    const url = this.buildURL("mints");
    return await this.httpRequest(url, schemas.Mint.array());
  }

  async getMint(mintAddress: string): Promise<Mint> {
    const url = this.buildURL(`mints/${mintAddress}`);
    return await this.httpRequest(url, schemas.Mint);
  }

  async getMarkets(): Promise<Market[]> {
    const url = this.buildURL("markets");
    return await this.httpRequest(url, schemas.Market.array());
  }

  async getMarket(marketAddress: string): Promise<Market> {
    const url = this.buildURL(`markets/${marketAddress}`);
    return await this.httpRequest(url, schemas.Market);
  }

  async getOraclePrices(): Promise<TokenOraclePrice[]> {
    const url = this.buildURL("oracle-prices");
    return await this.httpRequest(url, schemas.TokenOraclePrice.array());
  }

  async getOraclePrice(mintAddress: string): Promise<TokenOraclePrice> {
    const url = this.buildURL(`oracle-prices/${mintAddress}`);
    return await this.httpRequest(url, schemas.TokenOraclePrice);
  }

  async getVaults(): Promise<Vault[]> {
    const url = this.buildURL("vaults");
    return await this.httpRequest(url, schemas.Vault.array());
  }

  async getVault(vaultAddress: string): Promise<Vault> {
    const url = this.buildURL(`vaults/${vaultAddress}`);
    return await this.httpRequest(url, schemas.Vault);
  }

  /**
   *  Returns vault historical data for selected time interval.
   *
   *  Example usage: getVaultHistory('H3ifgix98vzi3yCPbmZDLTheeTRf2jykXx8FpY5L7Sfd', '2025-03-10', '2025-04-10')
   */
  async getVaultHistory(vaultAddress: string, from: Date, to: Date): Promise<VaultHistoricalStats[]> {
    const url = this.appendUrlSearchParams(this.buildURL(`vaults/${vaultAddress}/history`), {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
    // @ts-expect-error
    return await this.httpRequest(url, schemas.VaultHistoricalStats.array());
  }

  async getPools(providerFilter?: ProviderFilter): Promise<Pool[]> {
    const url = this.appendUrlSearchParams(this.buildURL("pools"), {
      provider: providerFilter && providerFilter !== ProviderFilter.ALL ? providerFilter : undefined,
    });
    return await this.httpRequest(url, schemas.Pool.array());
  }

  async getPool(address: string): Promise<Pool> {
    const url = this.buildURL(`pools/${address}`);
    return await this.httpRequest(url, schemas.Pool);
  }

  async getPoolTicks(poolAddress: string): Promise<PoolTicks> {
    const url = this.buildURL(`pools/${poolAddress}/ticks`);
    return await this.httpRequest(url, schemas.PoolTicks);
  }

  async getPoolSwaps(poolAddress: string): Promise<PoolSwap[]> {
    const url = this.buildURL(`pools/${poolAddress}/swaps`);
    return await this.httpRequest(url, schemas.PoolSwap.array());
  }

  async getPoolOrderBook(poolAddress: string, priceStep: number, inverted: boolean): Promise<OrderBook> {
    const url = this.appendUrlSearchParams(this.buildURL(`pools/${poolAddress}/order-book`), {
      price_step: priceStep,
      inverted: inverted || undefined,
    });
    return await this.httpRequest(url, schemas.OrderBook);
  }

  async getPoolPriceCandles(poolAddress: string, options: GetPoolPriceCandlesOptions): Promise<PoolPriceCandle[]> {
    const { from, to, interval, candles } = options;
    const url = this.appendUrlSearchParams(this.buildURL(`pools/${poolAddress}/candles`), {
      from: from.toISOString(),
      to: to.toISOString(),
      candles,
      interval,
    });
    return await this.httpRequest(url, schemas.PoolPriceCandle.array());
  }

  async getStakingTreasury(): Promise<StakingTreasury> {
    const url = this.buildURL(`staking/treasury`);
    return await this.httpRequest(url, schemas.StakingTreasury);
  }

  async getStakingLeaderboard(page: number, pageSize: number, search?: string): Promise<StakingLeaderboardPage> {
    const url = this.appendUrlSearchParams(this.buildURL(`staking/leaderboard`), {
      page,
      page_size: pageSize,
      search: search || undefined,
    });
    return await this.httpRequest(url, schemas.StakingLeaderboardPage, { parseRoot: true });
  }

  async getUserLendingPositions(userAddress: string): Promise<LendingPosition[]> {
    const url = this.buildURL(`users/${userAddress}/lending-positions`);
    return await this.httpRequest(url, schemas.LendingPosition.array());
  }

  async getUserLendingPositionByAddress(userAddress: string, lendingPositionAddress: string): Promise<LendingPosition> {
    const url = this.buildURL(`users/${userAddress}/lending-positions/${lendingPositionAddress}`);
    return await this.httpRequest(url, schemas.LendingPosition);
  }

  async getUserTunaPositions(userAddress: string): Promise<TunaPosition[]> {
    const url = this.buildURL(`users/${userAddress}/tuna-positions`);
    return await this.httpRequest(url, schemas.TunaPosition.array());
  }

  async getUserTunaPositionByAddress(userAddress: string, tunaPositionAddress: string): Promise<TunaPosition> {
    const url = this.buildURL(`users/${userAddress}/tuna-positions/${tunaPositionAddress}`);
    return await this.httpRequest(url, schemas.TunaPosition);
  }

  async getUserTunaSpotPositions(userAddress: string): Promise<TunaSpotPosition[]> {
    const url = this.buildURL(`users/${userAddress}/spot-positions`);
    return await this.httpRequest(url, schemas.TunaSpotPosition.array());
  }

  async getUserTunaSpotPositionByAddress(
    userAddress: string,
    tunaSpotPositionAddress: string,
  ): Promise<TunaSpotPosition> {
    const url = this.buildURL(`users/${userAddress}/spot-positions/${tunaSpotPositionAddress}`);
    return await this.httpRequest(url, schemas.TunaSpotPosition);
  }

  async getUserLimitOrders(userAddress: string, options?: GetUserLimitOrdersOptions): Promise<LimitOrder[]> {
    let query: QueryParams = {};

    if (options) {
      if (options.pool?.length) {
        query.pool = options.pool.join(",");
      }
      if (options.status?.length) {
        query.status = options.status.join(",");
      }
      if (options.openedAt?.from) {
        query.opened_at_from = options.openedAt.from.toISOString();
      }
      if (options.openedAt?.to) {
        query.opened_at_from = options.openedAt.to.toISOString();
      }
      if (options.limit) {
        query.limit = options.limit;
      }
      if (options.cursor) {
        query.cursor = options.cursor;
      }
      if (options.desc !== undefined) {
        query.desc = options.desc;
      }
    }

    const url = this.appendUrlSearchParams(this.buildURL(`users/${userAddress}/limit-orders`), query);

    return await this.httpRequest(url, schemas.LimitOrder.array());
  }

  async getUserLimitOrderByAddress(userAddress: string, limitOrderAddress: string): Promise<LimitOrder> {
    const url = this.buildURL(`users/${userAddress}/limit-orders/${limitOrderAddress}`);
    return await this.httpRequest(url, schemas.LimitOrder);
  }

  async getUserTradeHistory(userAddress: string, options?: GetUserTradeHistoryOptions): Promise<TradeHistoryEntry[]> {
    let query: QueryParams = {};

    if (options) {
      if (options.pool?.length) {
        query.pool = options.pool.join(",");
      }
      if (options.action?.length) {
        query.action = options.action.join(",");
      }
      if (options.uiDirection?.length) {
        query.ui_direction = options.uiDirection.join(",");
      }
      if (options.limit) {
        query.limit = options.limit;
      }
      if (options.cursor) {
        query.cursor = options.cursor;
      }
      if (options.desc !== undefined) {
        query.desc = options.desc;
      }
    }

    const url = this.appendUrlSearchParams(this.buildURL(`users/${userAddress}/trade-history`), query);

    return await this.httpRequest(url, schemas.TradeHistoryEntry.array());
  }

  async getUserOrderHistory(userAddress: string, options?: GetUserOrderHistoryOptions): Promise<OrderHistoryEntry[]> {
    let query: QueryParams = {};

    if (options) {
      if (options.pool?.length) {
        query.pool = options.pool.join(",");
      }
      if (options.orderType?.length) {
        query.order_type = options.orderType.join(",");
      }
      if (options.uiDiretion?.length) {
        query.ui_direction = options.uiDiretion.join(",");
      }
      if (options.limit) {
        query.limit = options.limit;
      }
      if (options.cursor) {
        query.cursor = options.cursor;
      }
      if (options.desc !== undefined) {
        query.desc = options.desc;
      }
    }

    const url = this.appendUrlSearchParams(this.buildURL(`users/${userAddress}/order-history`), query);

    return await this.httpRequest(url, schemas.OrderHistoryEntry.array());
  }

  async getUserStakingPosition(userAddress: string): Promise<StakingPosition> {
    const url = this.buildURL(`users/${userAddress}/staking-position`);
    return await this.httpRequest(url, schemas.StakingPosition);
  }

  async getUserStakingPositionHistory(userAddress: string): Promise<StakingPositionHistoryAction[]> {
    const url = this.buildURL(`users/${userAddress}/staking-position/history`);
    return await this.httpRequest(url, schemas.StakingPositionHistoryAction.array());
  }

  async getFeesStats(from: Date, to: Date, interval: string): Promise<FeesStatsGroup[]> {
    const url = this.appendUrlSearchParams(this.buildURL(`stats/fees`), {
      from: from.toISOString(),
      to: to.toISOString(),
      interval,
    });
    return await this.httpRequest(url, schemas.FeesStatsGroup.array());
  }

  async getStakingRevenueStats(from: Date, to: Date): Promise<StakingRevenueStatsGroup[]> {
    const url = this.appendUrlSearchParams(this.buildURL(`stats/staking/revenue`), {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    });
    return await this.httpRequest(url, schemas.StakingRevenueStatsGroup.array());
  }

  async getLimitOrderQuoteByInput(
    args: GetLimitOrderQuoteByInputArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<LimitOrderQuoteByInput> {
    const { pool, amountIn, aToB, tickIndex } = args;
    let query: QueryParams = {
      pool,
      amount_in: amountIn.toString(),
      a_to_b: aToB,
      tick_index: tickIndex,
    };

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/limit-order-by-input`), query);
    return await this.httpRequest(url, schemas.LimitOrderQuoteByInput, {
      signal: config?.abortSignal,
    });
  }

  async getLimitOrderQuoteByOutput(
    args: GetLimitOrderQuoteByOutputArgs,
    config?: { abortSignal?: AbortSignal },
  ): Promise<LimitOrderQuoteByOutput> {
    const { pool, amountOut, aToB, tickIndex } = args;
    let query: QueryParams = {
      pool,
      amount_out: amountOut.toString(),
      a_to_b: aToB,
      tick_index: tickIndex,
    };

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/limit-order-by-output`), query);
    return await this.httpRequest(url, schemas.LimitOrderQuoteByOutput, {
      signal: config?.abortSignal,
    });
  }

  async getSwapQuoteByInput(
    args: GetSwapQuoteByInputArgs,
    config?: { abortSignal?: AbortSignal },
  ): Promise<SwapQuoteByInput> {
    const { pool, amountIn, aToB, slippageToleranceBps } = args;
    let query: QueryParams = {
      pool,
      amount_in: amountIn.toString(),
      a_to_b: aToB,
    };

    if (slippageToleranceBps) {
      query.slippage_tolerance = slippageToleranceBps;
    }

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/swap-by-input`), query);
    return await this.httpRequest(url, schemas.SwapQuoteByInput, {
      signal: config?.abortSignal,
    });
  }

  async getSwapQuoteByOutput(
    args: GetSwapQuoteByOutputArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<SwapQuoteByOutput> {
    const { pool, amountOut, aToB, slippageToleranceBps } = args;
    let query: QueryParams = {
      pool,
      amount_out: amountOut.toString(),
      a_to_b: aToB,
    };

    if (slippageToleranceBps) {
      query.slippage_tolerance = slippageToleranceBps;
    }

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/swap-by-output`), query);
    return await this.httpRequest(url, schemas.SwapQuoteByOutput, {
      signal: config?.abortSignal,
    });
  }

  async getIncreaseSpotPositionQuote(
    args: GetIncreaseSpotPositionQuoteArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<IncreaseSpotPositionQuote> {
    const {
      market,
      increaseAmount,
      collateralToken,
      positionToken,
      leverage,
      positionAmount,
      positionDebt,
      slippageTolerance,
    } = args;

    let query: QueryParams = {
      market,
      increase_amount: increaseAmount.toString(),
      collateral_token: collateralToken,
      position_token: positionToken,
      leverage,
    };
    if (slippageTolerance) {
      query.slippage_tolerance = slippageTolerance;
    }
    if (positionAmount) {
      query.position_amount = positionAmount.toString();
    }
    if (positionDebt) {
      query.position_debt = positionDebt.toString();
    }

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/increase-spot-position`), query);
    return await this.httpRequest(url, schemas.IncreaseSpotPositionQuote, {
      signal: config?.abortSignal,
    });
  }

  async getDecreaseSpotPositionQuote(
    args: GetDecreaseSpotPositionQuoteArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<DecreaseSpotPositionQuote> {
    const {
      market,
      decreaseAmount,
      collateralToken,
      positionToken,
      leverage,
      positionAmount,
      positionDebt,
      slippageTolerance,
    } = args;

    let query: QueryParams = {
      market,
      decrease_amount: decreaseAmount.toString(),
      collateral_token: collateralToken,
      position_token: positionToken,
      leverage,
      position_amount: positionAmount.toString(),
      position_debt: positionDebt.toString(),
    };
    if (slippageTolerance) {
      query.slippage_tolerance = slippageTolerance;
    }

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/decrease-spot-position`), query);
    return await this.httpRequest(url, schemas.DecreaseSpotPositionQuote, {
      signal: config?.abortSignal,
    });
  }

  async getCloseSpotPositionQuote(
    args: GetCloseSpotPositionQuoteArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<CloseSpotPositionQuote> {
    const { market, decreasePercent, collateralToken, positionToken, positionAmount, positionDebt, slippageTolerance } =
      args;

    let query: QueryParams = {
      market,
      decrease_percent: decreasePercent,
      collateral_token: collateralToken,
      position_token: positionToken,
      position_amount: positionAmount.toString(),
      position_debt: positionDebt.toString(),
    };
    if (slippageTolerance) {
      query.slippage_tolerance = slippageTolerance;
    }

    const url = this.appendUrlSearchParams(this.buildURL(`quotes/close-spot-position`), query);
    return await this.httpRequest(url, schemas.CloseSpotPositionQuote, {
      signal: config?.abortSignal,
    });
  }

  async getTradableAmount(
    args: GetTradableAmountArgs,
    config?: {
      abortSignal?: AbortSignal;
    },
  ): Promise<TradableAmount> {
    const { market, collateralToken, positionToken, availableBalance, leverage, positionAmount, increase } = args;
    const url = this.appendUrlSearchParams(this.buildURL(`quotes/tradable-amount`), {
      market,
      collateral_token: collateralToken,
      position_token: positionToken,
      available_balance: availableBalance.toString(),
      leverage,
      position_amount: positionAmount.toString(),
      increase,
    });
    return await this.httpRequest(url, schemas.TradableAmount, {
      signal: config?.abortSignal,
    });
  }

  async getUpdatesStream(): Promise<EventSource> {
    const url = this.buildURL(`streams/sse`);
    return new EventSource(url);
  }

  async updateStreamSubscription(streamId: string, subscription: SubscriptionPayload): Promise<unknown> {
    const url = this.buildURL(`streams/${streamId}/subscription`);
    const body = JSON.stringify(snakecaseKeys(subscription, { deep: true }));
    return await this.httpRequest(url, schemas.UpdateStreamSubscriptionResult, { method: "PUT", body });
  }

  /* Utility functions */
  private buildURL(endpoint: string) {
    // We ensure the `baseURL` ends with a `/` so that URL doesn't resolve the
    // path relative to the parent.
    return `${this.baseURL}${this.baseURL.endsWith("/") ? "" : "/"}v1/${endpoint}`;
  }

  private appendUrlSearchParams(url: string, params: QueryParams): string {
    const urlSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlSearchParams.append(key, String(value));
      }
    });

    if (urlSearchParams.size > 0) {
      return `${url}?${urlSearchParams.toString()}`;
    }

    return url;
  }
}
