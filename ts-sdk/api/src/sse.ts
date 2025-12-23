import { EventSource } from "eventsource";

import {
  getSseUrl,
  NotificationDtoLendingPositionDto,
  NotificationDtoOrderHistoryEntryDto,
  NotificationDtoPoolSwapDto,
  NotificationDtoStakingPositionDto,
  NotificationDtoTradeHistoryEntryDto,
  NotificationEntity,
  SnapshotContainer,
  SseResponse,
  StreamInitalMessage,
} from "./gen/defiTunaAPI";
import { resolveTunaUrl } from "./baseUrl";

export const getSseUpdatesStream = async (): Promise<EventSource> => {
  const url = resolveTunaUrl(getSseUrl());
  return new EventSource(url);
};

export function eventIsInitialMessage(event: SseResponse): event is StreamInitalMessage {
  return !("entity" in event) || ("entity" in event && event.entity === NotificationEntity.initialMessage);
}

export function eventIsPoolSwap(event: SseResponse): event is NotificationDtoPoolSwapDto {
  return "entity" in event && event.entity === NotificationEntity.poolSwap;
}

export function eventIsStakingPosition(event: SseResponse): event is NotificationDtoStakingPositionDto {
  return "entity" in event && event.entity === NotificationEntity.stakingPosition;
}

export function eventIsLendingPosition(event: SseResponse): event is NotificationDtoLendingPositionDto {
  return "entity" in event && event.entity === NotificationEntity.lendingPosition;
}

export function eventIsTradeHistory(event: SseResponse): event is NotificationDtoTradeHistoryEntryDto {
  return "entity" in event && event.entity === NotificationEntity.tradeHistoryEntry;
}

export function eventIsOrderHistory(event: SseResponse): event is NotificationDtoOrderHistoryEntryDto {
  return "entity" in event && event.entity === NotificationEntity.orderHistoryEntry;
}

export function eventIsStateSnapshot(event: SseResponse): event is SnapshotContainer {
  return "entity" in event && event.entity === NotificationEntity.stateSnapshot;
}
