import { HistorySnapshot } from 'scripts/History';

export const kingMoves: HistorySnapshot = function () {
  const list = [];

  list[45] = '000';

  return {
    chessboard: list,
    storage: <string[]>[]
  };
}();

export const kingMovesWithObstacles: HistorySnapshot = function () {
  const list = [];

  list[45] = '000';
  list[32] = '510';
  list[53] = '600';

  return {
    chessboard: list,
    storage: <string[]>[]
  };
}();

export const check: HistorySnapshot = function () {
  const list = [];

  list[84] = '000';
  list[81] = '410';
  list[78] = '110';

  return {
    chessboard: list,
    storage: <string[]>[]
  };
}();

export const checkMate: HistorySnapshot = function () {
  const list = [];

  list[45] = '000';

  return {
    chessboard: list,
    storage: <string[]>[]
  };
}();
