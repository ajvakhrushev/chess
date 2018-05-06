import { Observer } from './Observer';

export class Model extends Observer {

  constructor() {
    super();
  }

  pieceCalculateMoves() {}

  pieceMove() {}

}

export interface Field {
  piece: string;
  team: string;
}