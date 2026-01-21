import { EventSource } from "eventsource";

import {
  getSseUrl,
  NotificationEntity,
  SseResponse,
  SseResponseInitialMessage,
  SseResponseLendingPosition,
  SseResponseOrderHistoryEntry,
  SseResponsePoolSwap,
  SseResponseSnapshot,
  SseResponseStakingPosition,
  SseResponseTradeHistoryEntry,
} from "./gen/defiTunaAPI";
import { resolveTunaUrl } from "./baseUrl";

export const getSseUpdatesStream = async (): Promise<EventSource> => {
  const url = resolveTunaUrl(getSseUrl());
  return new EventSource(url);
};

export function eventIsInitialMessage(event: SseResponse): event is SseResponseInitialMessage {
  return !("entity" in event) || ("entity" in event && event.entity === NotificationEntity.initialMessage);
}

export function eventIsPoolSwap(event: SseResponse): event is SseResponsePoolSwap {
  return "entity" in event && event.entity === NotificationEntity.poolSwap;
}

export function eventIsStakingPosition(event: SseResponse): event is SseResponseStakingPosition {
  return "entity" in event && event.entity === NotificationEntity.stakingPosition;
}

export function eventIsLendingPosition(event: SseResponse): event is SseResponseLendingPosition {
  return "entity" in event && event.entity === NotificationEntity.lendingPosition;
}

export function eventIsTradeHistory(event: SseResponse): event is SseResponseTradeHistoryEntry {
  return "entity" in event && event.entity === NotificationEntity.tradeHistoryEntry;
}

export function eventIsOrderHistory(event: SseResponse): event is SseResponseOrderHistoryEntry {
  return "entity" in event && event.entity === NotificationEntity.orderHistoryEntry;
}

export function eventIsStateSnapshot(event: SseResponse): event is SseResponseSnapshot {
  return "entity" in event && event.entity === NotificationEntity.stateSnapshot;
}
