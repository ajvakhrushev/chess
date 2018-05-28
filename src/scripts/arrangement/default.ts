import { HistorySnapshot } from 'scripts/History';

export const _default: HistorySnapshot = function () {
  const list: string[] = [];

  list[11] = '400';
  list[12] = '200';
  list[13] = '300';
  list[14] = '000';
  list[15] = '100';
  list[16] = '300';
  list[17] = '200';
  list[18] = '400';

  list[81] = '410';
  list[82] = '210';
  list[83] = '310';
  list[84] = '010';
  list[85] = '110';
  list[86] = '310';
  list[87] = '210';
  list[88] = '410';

  for (let i = 1, length = 8; i <= length; i+=1) {
    list[20 + i] = '500';
    list[70 + i] = '610';
  }

  return {
    chessboard: list,
    storage: <string[]>[]
  };
}();

export const defaultOpposite: HistorySnapshot = function () {
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
    storage: <string[]>[]
  };
}();

export const testArrangement: HistorySnapshot = function () {
  const list: string[] = [];

  list[84] = '010';
  list[14] = '000';

  list[11] = '400';
  list[78] = '400';
  list[38] = '610';

  return {
    chessboard: list,
    storage: ['200', '300', '610', '500', '400', '100']
  };
}();
