import { KING, QUEEN, KNIGHT, BISHOP, ROOK, PAWN_UP, PAWN_DOWN, Piece } from 'scripts/Piece';
import { WHITE, BLACK, Team } from 'scripts/Team';
import { Field } from 'scripts/Field';

export interface HistoryAction {
  piece: Piece;
  team: Team;
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

export const snapshots: {[key: string]: HistorySnapshot} = {
  empty: {
    chessboard: [],
    storage: []
  },
  default: buildDefaultArrangement(),
  defaultOpposite: buildDefaultArrangementOpposite(),
  test: buildTestArrangement()
};

function buildDefaultArrangement(): HistorySnapshot {
  const list: string[] = [];

  list[11] = '400';
  list[12] = '200';
  list[13] = '300';
  list[14] = '100';
  list[15] = '000';
  list[16] = '300';
  list[17] = '200';
  list[18] = '400';

  list[81] = '410';
  list[82] = '210';
  list[83] = '310';
  list[84] = '110';
  list[85] = '010';
  list[86] = '310';
  list[87] = '210';
  list[88] = '410';

  for (let i = 1, length = 8; i <= length; i+=1) {
    list[20 + i] = '500';
    list[70 + i] = '610';
  }

  return {
    chessboard: list,
    storage: []
  };
}

function buildDefaultArrangementOpposite(): HistorySnapshot {
  const list: string[] = [];

  list[11] = '410';
  list[12] = '210';
  list[13] = '310';
  list[14] = '110';
  list[15] = '010';
  list[16] = '310';
  list[17] = '210';
  list[18] = '410';

  list[81] = '400';
  list[82] = '200';
  list[83] = '300';
  list[84] = '100';
  list[85] = '000';
  list[86] = '300';
  list[87] = '200';
  list[88] = '400';

  for (let i = 1, length = 8; i <= length; i+=1) {
    list[20 + i] = '500';
    list[70 + i] = '610';
  }

  return {
    chessboard: list,
    storage: []
  };
}

function buildTestArrangement(): HistorySnapshot {
  const list: string[] = [];

  list[84] = '010';
  list[14] = '000';

  list[61] = '400';
  list[78] = '400';
  list[38] = '610';

  return {
    chessboard: list,
    storage: ['200', '300', '610', '500', '400', '100']
  };
}
