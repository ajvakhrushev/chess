import { Team, WHITE, BLACK } from 'scripts/Team';

export const KING = 'king';
export const QUEEN = 'queen';
export const KNIGHT = 'knight';
export const BISHOP = 'bishop';
export const ROOK = 'rook';
export const PAWN_UP = 'pawnUp';
export const PAWN_DOWN = 'pawnDown';

export type PAWN = 'pawnUp' | 'pawnDown';
export type Piece = 'king' | 'queen' | 'knight' | 'bishop' | 'rook' | 'pawnUp' | 'pawnDown';
export type PieceHasMultiplyStrategies = 'queen' | 'bishop' | 'rook';

export interface PieceViewMap {
  [key: string]: { [key: string]: string; }
};

export const pieceViewMap: PieceViewMap = {
  [WHITE]: {
    [KING]: '&#9812;',
    [QUEEN]: '&#9813;',
    [KNIGHT]: '&#9816;',
    [BISHOP]: '&#9815;',
    [ROOK]: '&#9814;',
    [PAWN_UP]: '&#9817;',
    [PAWN_DOWN]: '&#9817;'
  },
  [BLACK]: {
    [KING]: '&#9818;',
    [QUEEN]: '&#9819;',
    [KNIGHT]: '&#9822;',
    [BISHOP]: '&#9821;',
    [ROOK]: '&#9820;',
    [PAWN_UP]: '&#9823;',
    [PAWN_DOWN]: '&#9823;'
  }
};
