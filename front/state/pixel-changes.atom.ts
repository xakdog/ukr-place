import {atom} from "recoil";
import {Vector} from "vecti";

export type UniqueKey = string;

export enum PixelSyncStatus {
  ACCEPTING_CHANGES,
  COMMIT_CHANGES,
  AWAITING_CONFIRMATION,
  CHANGES_CONFIRMED,
}

export type PixelChange = {
  pos: Vector;
  color: string;
};

export type TileChange = {
  pos: Vector;
  size: Vector;
  data: Blob;
};

const defaultState = {
  updates: {} as Record<UniqueKey, TileChange>,
  syncing: {} as Record<UniqueKey, PixelChange>,
  syncStatus: PixelSyncStatus.ACCEPTING_CHANGES as PixelSyncStatus,
};

type State = typeof defaultState;

export const pixelChangesState = atom({
  key: 'globalPixelChanges',
  default: defaultState,
});

const setStatus = (status: PixelSyncStatus) => (state: State): State =>
  ({ ...state, syncStatus: status });

const updateTile = (changes: TileChange, randomId: string) => (state: State): State =>
  ({ ...state, updates: {...state.updates, [randomId]: changes } });

const paintPixel = (color: string, pos: Vector, randomId: string) => (state: State): State  => {
  const change: PixelChange = {
    color,
    pos,
  };

  return {
  ...state,
    syncing: { ...state.syncing, [randomId]: change }
  }
};

const cleanUpdates = (drawnIds: string[]) => (state: State): State => {
  if (drawnIds.length < 1)
    return state;

  const updates = Object
    .keys(state.updates)
    .filter(key => !drawnIds.includes(key))
    .reduce((rest: Record<UniqueKey, TileChange>, key) => {
      rest[key] = state.updates[key];
      return rest;
    }, {});

  return { ...state, updates };
};

const cleanSyncing = (drawnIds: string[] | 'all') => (state: State): State => {
  if (drawnIds.length < 1)
    return state;

  if (drawnIds === 'all') {
    return { ...state, syncing: {} };
  }

  const syncing = Object
    .keys(state.syncing)
    .filter(key => !drawnIds.includes(key))
    .reduce((rest: Record<UniqueKey, PixelChange>, key) => {
      rest[key] = state.syncing[key];
      return rest;
    }, {});

  return { ...state, syncing };
}

export const pixelChangesActions = { setStatus, paintPixel, cleanUpdates, cleanSyncing, updateTile };
