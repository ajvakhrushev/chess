import { KING, QUEEN, KNIGHT, BISHOP, ROOK, PAWN_UP, PAWN_DOWN, Piece } from 'scripts/Piece';
import { WHITE, BLACK, Team } from 'scripts/Team';
import { Field } from 'scripts/Field';

export interface HistoryAction {
  prev: Field,
  next: Field,
  move: number[];
};

export interface SnapshotMapToField {
  piece: Piece[];
  team: Team[];
  didUpdate: boolean[];
}

export interface HistorySnapshot {
  chessboard: string[];
  storage: string[];
};

export interface HistoryStorage {
  key: Team,
  values: Field[]
};

export const snapshotMapToField: SnapshotMapToField = {
  piece: [KING, QUEEN, KNIGHT, BISHOP, ROOK, PAWN_UP, PAWN_DOWN],
  team: [WHITE, BLACK],
  didUpdate: [false, true]
};
