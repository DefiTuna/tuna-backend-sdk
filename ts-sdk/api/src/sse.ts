import { EventSource } from "eventsource";

import {
  getSseUrl,
  NotificationDtoPoolSwapDtoEmptyMeta,
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

export function eventIsPoolSwap(event: SseResponse): event is NotificationDtoPoolSwapDtoEmptyMeta {
  return "entity" in event && event.entity === NotificationEntity.poolSwap;
}

export function eventIsStateSnapshot(event: SseResponse): event is SnapshotContainer {
  return "entity" in event && event.entity === NotificationEntity.stateSnapshot;
}
