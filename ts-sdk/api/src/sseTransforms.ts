import {
  getLendingPositionResponseTransformer,
  getLimitOrdersResponseTransformer,
  getMarketResponseTransformer,
  getOrderHistoryResponseTransformer,
  getPoolOrderBookResponseTransformer,
  getPoolSwapsResponseTransformer,
  getSpotPositionsResponseTransformer,
  getTradeHistoryResponseTransformer,
  getTunaPositionResponseTransformer,
  getTunaPositionsResponseTransformer,
  getUserStakingPositionResponseTransformer,
} from "./client/transformers.gen";
import { NotificationEntity } from "./client/types.gen";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const toBigInt = (value: unknown): bigint => {
  if (value === undefined || value === null) {
    throw new Error("Expected value to convert to bigint");
  }
  if (typeof value === "bigint") return value;
  return BigInt(value.toString());
};

const transformMarketsMap = async (markets: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const transformed = await Promise.all(
    Object.entries(markets).map(async ([address, market]) => {
      if (!isRecord(market)) {
        return [address, market] as const;
      }
      const response = await getMarketResponseTransformer({
        data: market,
      });
      return [address, response.data] as const;
    }),
  );
  return Object.fromEntries(transformed);
};

const normalizeMintsMap = (mints: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(mints).map(([address, mint]) => [address, mint]));

export const applySseResponseTransforms = async (payload: unknown): Promise<unknown> => {
  if (!isRecord(payload)) return payload;

  switch (payload.entity) {
    case NotificationEntity.POOL_SWAP: {
      if (!payload.data) return payload;
      const response = await getPoolSwapsResponseTransformer({
        data: [payload.data],
      });
      payload.data = response.data[0];
      return payload;
    }
    case NotificationEntity.STAKING_POSITION: {
      if (!payload.data) return payload;
      const response = await getUserStakingPositionResponseTransformer({
        data: payload.data,
      });
      payload.data = response.data;
      return payload;
    }
    case NotificationEntity.LENDING_POSITION: {
      if (!payload.data) return payload;
      const response = await getLendingPositionResponseTransformer({
        data: payload.data,
      });
      payload.data = response.data;
      return payload;
    }
    case NotificationEntity.TRADE_HISTORY_ENTRY: {
      if (!payload.data || !isRecord(payload.data) || !payload.data.item) return payload;
      const response = await getTradeHistoryResponseTransformer({
        data: {
          items: [payload.data.item],
          markets: isRecord(payload.data.markets) ? payload.data.markets : {},
          mints: isRecord(payload.data.mints) ? payload.data.mints : {},
        },
      });
      payload.data.item = response.data.items[0];
      if (isRecord(payload.data.markets)) {
        payload.data.markets = await transformMarketsMap(payload.data.markets);
      }
      if (isRecord(payload.data.mints)) {
        payload.data.mints = normalizeMintsMap(payload.data.mints);
      }
      return payload;
    }
    case NotificationEntity.ORDER_HISTORY_ENTRY: {
      if (!payload.data || !isRecord(payload.data) || !payload.data.item) return payload;
      const response = await getOrderHistoryResponseTransformer({
        data: {
          items: [payload.data.item],
          markets: isRecord(payload.data.markets) ? payload.data.markets : {},
          mints: isRecord(payload.data.mints) ? payload.data.mints : {},
        },
      });
      payload.data.item = response.data.items[0];
      if (isRecord(payload.data.markets)) {
        payload.data.markets = await transformMarketsMap(payload.data.markets);
      }
      if (isRecord(payload.data.mints)) {
        payload.data.mints = normalizeMintsMap(payload.data.mints);
      }
      return payload;
    }
    case NotificationEntity.STATE_SNAPSHOT: {
      if (!payload.data || !isRecord(payload.data)) return payload;
      const snapshot = payload.data as Record<string, unknown>;

      if (typeof snapshot.blockTime === "string") {
        snapshot.blockTime = new Date(snapshot.blockTime);
      }
      if (snapshot.slot !== undefined && snapshot.slot !== null) {
        snapshot.slot = toBigInt(snapshot.slot);
      }

      if (isRecord(snapshot.markets)) {
        snapshot.markets = await transformMarketsMap(snapshot.markets);
      }

      if (isRecord(snapshot.mints)) {
        snapshot.mints = normalizeMintsMap(snapshot.mints);
      }

      if (Array.isArray(snapshot.orderBooks)) {
        const transformed = await Promise.all(
          snapshot.orderBooks.map(async item => {
            const response = await getPoolOrderBookResponseTransformer({
              data: item,
            });
            return response.data;
          }),
        );
        snapshot.orderBooks = transformed;
      }

      if (Array.isArray(snapshot.fusionLimitOrders)) {
        const response = await getLimitOrdersResponseTransformer({
          data: {
            items: snapshot.fusionLimitOrders,
            markets: {},
            mints: {},
          },
        });
        snapshot.fusionLimitOrders = response.data.items;
      }

      if (Array.isArray(snapshot.tunaLpPositions)) {
        const response = await getTunaPositionsResponseTransformer({
          data: {
            items: snapshot.tunaLpPositions,
            markets: {},
            mints: {},
          },
        });
        snapshot.tunaLpPositions = response.data.items;
      }

      if (Array.isArray(snapshot.tunaSpotPositions)) {
        const response = await getSpotPositionsResponseTransformer({
          data: {
            items: snapshot.tunaSpotPositions,
            markets: {},
            mints: {},
          },
        });
        snapshot.tunaSpotPositions = response.data.items;
      }

      return payload;
    }
    case NotificationEntity.TUNA_POSITION: {
      if (!payload.data) return payload;
      const response = await getTunaPositionResponseTransformer({
        data: payload.data,
      });
      payload.data = response.data;
      return payload;
    }
    default:
      return payload;
  }
};
