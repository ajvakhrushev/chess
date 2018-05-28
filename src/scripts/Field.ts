import { Piece } from 'scripts/Piece';
import { Team } from 'scripts/Team';

export interface Field {
  piece: Piece;
  team: Team;
  didUpdate: boolean
}

export const fieldViewMap: string[] = [
  null,
  'H',
  'G',
  'F',
  'E',
  'D',
  'C',
  'B',
  'A'
];