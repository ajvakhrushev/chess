import { clone } from 'scripts/Utilities';
import {
  KING,
  QUEEN,
  KNIGHT,
  BISHOP,
  ROOK,
  PAWN_UP,
  PAWN_DOWN,
  Piece,
  PieceHasMultiplyStrategies,
  PAWN
} from 'scripts/Piece';
import { WHITE, BLACK } from 'scripts/Team';
import { Field } from 'scripts/Field';
import { HistoryAction } from 'scripts/History';

export interface PieceStrategy {
  (value: number): number;
};

export interface RooksMove {
  indexFrom: number,
  indexTo: number,
  kingStrategy: PieceStrategy
};

export const left: PieceStrategy = (value: number): number => value + 1;
export const upLeft: PieceStrategy = (value: number): number => value + 11;
export const up: PieceStrategy = (value: number): number => value + 10;
export const upRight: PieceStrategy = (value: number): number => value + 9;
export const right: PieceStrategy = (value: number): number => value - 1;
export const downRight: PieceStrategy = (value: number): number => value - 11;
export const down: PieceStrategy = (value: number): number => value - 10;
export const downLeft: PieceStrategy = (value: number): number => value - 9;
export const knightLeftUp: PieceStrategy = (value: number): number => value + 12;
export const knightUpLeft: PieceStrategy = (value: number): number => value + 21;
export const knightUpRight: PieceStrategy = (value: number): number => value + 19;
export const knightRightUp: PieceStrategy = (value: number): number => value + 8;
export const knightRightDown: PieceStrategy = (value: number): number => value - 12;
export const knightDownRight: PieceStrategy = (value: number): number => value - 21;
export const knightDownLeft: PieceStrategy = (value: number): number => value - 19;
export const knightLeftDown: PieceStrategy = (value: number): number => value - 8;

export const strategies = {
  [KING]: {
    move: [left, upLeft, up, upRight, right, downRight, down, downLeft],
    castling: [left, right],
    check: [
      {
        keys: [QUEEN, BISHOP],
        values: [upLeft, upRight, downRight, downLeft],
        isMultiply: true
      },
      {
        keys: [QUEEN, ROOK],
        values: [left, up, right, down],
        isMultiply: true
      },
      {
        keys: [KING],
        values: [left, upLeft, up, upRight, right, downRight, down, downLeft],
        isMultiply: false
      },
      {
        keys: [PAWN_UP],
        values: [downLeft, downRight],
        isMultiply: false
      },
      {
        keys: [PAWN_DOWN],
        values: [upLeft, upRight],
        isMultiply: false
      }
    ]
  },
  [QUEEN]: [left, upLeft, up, upRight, right, downRight, down, downLeft],
  [KNIGHT]: [knightLeftUp, knightUpLeft, knightUpRight, knightRightUp, knightRightDown, knightDownRight, knightDownLeft, knightLeftDown],
  [BISHOP]: [upLeft, upRight, downRight, downLeft],
  [ROOK]: [left, up, right, down],
  [PAWN_UP]: {
    move: [up],
    beat: [upLeft, upRight],
    enPassant: [knightUpLeft, knightUpRight]
  },
  [PAWN_DOWN]: {
    move: [down],
    beat: [downLeft, downRight],
    enPassant: [knightDownLeft, knightDownRight]
  }
};

export const isMovePossibleInCommon = (current: Field, next: Field) => !!next && (!next.piece || (current.team !== next.team && next.piece !== KING));
export const isCheckPossibleInCommon = (current: Field, next: Field) => !!next && (!next.piece || (current.team !== next.team));
export const isBeatMovePossible = (current: Field, next: Field) => !!next && !!next.piece && current.team !== next.team && next.piece !== KING;
export const isEnPassantMovePossible = (current: Field, next: Field, indexFrom: number, indexTo: number, history: HistoryAction[]) => {
  const lastMove = history[history.length - 1];

  if (
      !lastMove
      || !next
      || !!next.piece
      || (lastMove.team === current.team)
      || (lastMove.piece !== PAWN_UP && lastMove.piece !== PAWN_DOWN)
      || (Math.abs(lastMove.move[1] - lastMove.move[0]) !== 20)
     ) {
    return false;
  }

  return ((lastMove.move[1] - lastMove.move[0])/2 + lastMove.move[0]) === indexTo;
};

const onSimpleMove = (index: number, current: Field, fields: Field[], history?: HistoryAction[]) => (prev: number[], strategy: PieceStrategy) => {
  const nextIndex = strategy(index);
  const next = fields[nextIndex];

  if (isMovePossibleInCommon(current, next)) {
    prev.push(nextIndex);
  }

  return prev;
};

const onMultiplyMove = (index: number, current: Field, fields: Field[], history?: HistoryAction[]) => (prev: number[], strategy: PieceStrategy) => {
  let nextIndex: number = index;
  let next: Field = current;

  while((nextIndex = strategy(nextIndex)) && (next = fields[nextIndex]) && isMovePossibleInCommon(current, next)) {
    prev.push(nextIndex);

    if (next.piece && next.team !== current.team) {
      break;
    }
  }

  return prev;
};

const onPawnBeatMove = (index: number, current: Field, fields: Field[], history?: HistoryAction[]) => (prev: number[], strategy: PieceStrategy) => {
  const nextIndex = strategy(index);
  const next = fields[nextIndex];

  if (isBeatMovePossible(current, next) || isEnPassantMovePossible(current, next, index, nextIndex, history)) {
    prev.push(nextIndex);
  }

  return prev;
};

const queenStrategy = (piece: PieceHasMultiplyStrategies) => (index: number, current: Field, fields: Field[], history?: HistoryAction[]): number[] => {
  return strategies[piece].reduce(onMultiplyMove(index, current, fields), <number[]>[]);
};

const pawnStrategy = (index: number, current: Field, fields: Field[], history?: HistoryAction[]): number[] => {
  let moves: number[] = [];

  for (let i = 0, length = current.didUpdate ? 1 : 2; i < length; i+=1) {
    const last = moves.length > 0 ? moves[moves.length - 1] : index;

    moves = moves.concat(strategies[<PAWN>current.piece].move.reduce(onSimpleMove(last, current, fields), <number[]>[]));
  }

  return moves.concat(strategies[<PAWN>current.piece].beat.reduce(onPawnBeatMove(index, current, fields, history), <number[]>[]));
};

export const calculatePossibleMoves = {
  [KING]: (index: number, current: Field, fields: Field[], history?: HistoryAction[]): number[] => {
    const moves = strategies[KING].move.reduce(onSimpleMove(index, current, fields), <number[]>[]);

    if (current.didUpdate || isCheck(index, current, fields)) {
      return moves;
    }

    let rooksMoves: RooksMove[];

    switch (current.team) {
      case WHITE:
        rooksMoves = [{indexFrom: 11, indexTo: 13, kingStrategy: right}, {indexFrom: 18, indexTo: 15, kingStrategy: left}];
        break;
      case BLACK:
        rooksMoves = [{indexFrom: 81, indexTo: 83, kingStrategy: right}, {indexFrom: 88, indexTo: 85, kingStrategy: left}];
        break;
      default:
        return moves;
    }

    rooksMoves = rooksMoves.filter((next: RooksMove) => {
      const field = fields[next.indexFrom];

      if (field.didUpdate || field.piece !== ROOK) {
        return false;
      }

      const moves = calculatePossibleMoves[ROOK](next.indexFrom, field, fields);

      return !!moves.includes(next.indexTo);
    });

    const castlingMoves = rooksMoves.reduce((prev: number[], next: RooksMove) => {
      let last = index;
      let nextFields = fields;

      for (let i = 0, length = 2; i < length; i+=1) {
        const nextIndex = next.kingStrategy(last);

        nextFields = preMove(last, nextIndex, nextFields);

        if (isCheck(nextIndex, nextFields[nextIndex], nextFields)) {
          last = null;
          break;
        }

        last = nextIndex;
      }

      if (last) {
        prev.push(last);
      }

      return prev;
    }, <number[]>[]);

    return moves.concat(castlingMoves);
  },
  [KNIGHT]: (index: number, current: Field, fields: Field[], history?: HistoryAction[]): number[] => {
    return strategies[KNIGHT].reduce(onSimpleMove(index, current, fields), <number[]>[]);
  },
  [QUEEN]: queenStrategy(QUEEN),
  [BISHOP]: queenStrategy(BISHOP),
  [ROOK]: queenStrategy(ROOK),
  [PAWN_UP]: pawnStrategy,
  [PAWN_DOWN]: pawnStrategy
};

export const preMove = (indexFrom: number, indexTo: number, fields: Field[]): Field[] => {
  const nextFields = clone(fields);

  nextFields[indexTo] = {
    piece: nextFields[indexFrom].piece,
    team: nextFields[indexFrom].team,
    didUpdate: true
  };

  nextFields[indexFrom] = {
    piece: null,
    team: null,
    didUpdate: true
  };

  return nextFields;
};

export const isCheck = (index: number, current: Field, fields: Field[]): boolean => {
  return strategies[KING].check.some(({keys, values, isMultiply}): boolean => {
    return values.some((strategy: PieceStrategy) => {
      let nextIndex: number = index;
      let next: Field = current;
      let last: Field;

      while((nextIndex = strategy(nextIndex)) && (next = fields[nextIndex]) && isCheckPossibleInCommon(current, next)) {
        last = next;

        if (!isMultiply || (!!next.piece && next.team !== current.team)) {
          break;
        }
      }

      return !!last && last.piece && keys.includes(last.piece);
    });
  });

};

export const isCheckMate = (index: number, current: Field, fields: Field[]): boolean => {
  const moves = calculatePossibleMoves[KING](index, current, fields);

  const cannotMoveOut = moves.every((indexTo: number) => {
    const nextFields = preMove(index, indexTo, fields);

    return isCheck(indexTo, nextFields[indexTo], nextFields);
  });

  if (!cannotMoveOut) {
    return false;
  }

  const dangerDirections = strategies[KING].check.reduce((prev: number[], {keys, values}): number[] => {
    const nextDirections = values.reduce((prev: number[], strategy: PieceStrategy) => {
      const indexes: number[] = [];
      let nextIndex: number = index;
      let next: Field = current;
      let last: Field;

      while((nextIndex = strategy(nextIndex)) && (next = fields[nextIndex]) && isMovePossibleInCommon(current, next)) {
        indexes.push(nextIndex);

        last = next;
      }

      return !!last && last.piece && keys.includes(last.piece) ? prev.concat(indexes) : prev;
    }, []);

    return nextDirections.concat(prev);
  }, <number[]>[]);

  const teamIndexes = fields.reduce((prev: number[], next: Field, index: number) => {
    if (next && next.team === current.team && next.piece !== KING) {
      prev.push(index);
    }

    return prev;
  }, <number[]>[]);

  return teamIndexes.every((indexFrom: number): boolean => {
    const current: Field = fields[indexFrom];
    const moves: number[] = calculatePossibleMoves[current.piece](indexFrom, current, fields);

    return dangerDirections.every((indexTo: number): boolean => {
      if (!moves.includes(indexTo)) {
        return true;
      }

      const nextFields = preMove(indexFrom, indexTo, fields);

      return isCheck(index, current, nextFields);
    });
  });
};

export const canPawnPromote = (index: number, field: Field, fields: Field[], history?: HistoryAction[]): boolean => {
  let lastLine: number[];

  switch (field.piece) {
    case PAWN_UP:
      lastLine = [80, 90];
      break;
    case PAWN_DOWN:
      lastLine = [10, 20];
      break;
    default:
      return false;
  }

  return index > lastLine[0] && index < lastLine[1];
}

export const promotePawn = (index: number, field: Field, fields: Field, history?: HistoryAction[]) => {

}