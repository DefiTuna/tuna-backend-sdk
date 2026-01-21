import {
  getLendingPositionResponseTransformer,
  getLimitOrdersResponseTransformer,
  getMarketsResponseTransformer,
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
      if (!payload.data) return payload;
      const response = await getTradeHistoryResponseTransformer({
        data: [payload.data],
      });
      payload.data = response.data[0];
      return payload;
    }
    case NotificationEntity.ORDER_HISTORY_ENTRY: {
      if (!payload.data) return payload;
      const response = await getOrderHistoryResponseTransformer({
        data: [payload.data],
      });
      payload.data = response.data[0];
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

      if (Array.isArray(snapshot.markets)) {
        const response = await getMarketsResponseTransformer({
          data: snapshot.markets,
        });
        snapshot.markets = response.data;
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
          data: snapshot.fusionLimitOrders,
        });
        snapshot.fusionLimitOrders = response.data;
      }

      if (Array.isArray(snapshot.tunaLpPositions)) {
        const response = await getTunaPositionsResponseTransformer({
          data: snapshot.tunaLpPositions,
        });
        snapshot.tunaLpPositions = response.data;
      }

      if (Array.isArray(snapshot.tunaSpotPositions)) {
        const response = await getSpotPositionsResponseTransformer({
          data: snapshot.tunaSpotPositions,
        });
        snapshot.tunaSpotPositions = response.data;
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
