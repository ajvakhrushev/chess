import { Piece } from 'scripts/Piece';
import { Team } from 'scripts/Team';

export interface Field {
  piece: Piece;
  team: Team;
  didUpdate: boolean
}
