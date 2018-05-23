import { Observer } from 'scripts/Observer';
import { Field } from 'scripts/Field';
import { Team, WHITE, BLACK } from 'scripts/Team';
import { HistoryAction, HistoryStorage, HistorySnapshot, snapshotMapToField, snapshots } from 'scripts/History';
import { Piece, QUEEN, KNIGHT, ROOK, BISHOP, PAWN, KING, PAWN_UP, PAWN_DOWN } from 'scripts/Piece';
import {
  PieceStrategy,
  calculatePossibleMoves,
  canPawnPromote,
  isEnPassantMovePossible,
  strategies,
  preMove,
  isCheck,
  isCheckMate
} from 'scripts/PieceStrategies';

interface Selected {
  index: number;
  field: Field;
  possibleMoves: number[];
}

export class Model extends Observer {

  fields: Field[] = [];
  history: HistoryAction[] = [];
  selected: Selected;
  activeTeam: Team;
  promotePieces: Piece[] = [QUEEN, KNIGHT, ROOK, BISHOP];
  storage: HistoryStorage[];

  constructor() {
    super();

    for (let i = 80, iMin = 10; i >= iMin; i-=10) {
      for (let j = 8, jMin = 1; j >= jMin; j-=1) {
        this.fields[i + j] = {piece: null, team: null, didUpdate: false};
      }
    }

    this.trigger('chessboard:didCreate', this.fields);
  }

  willSelect(index: number) {
    // const canBeSelected = index && !!this.fields[index] && !!this.fields[index].piece && this.fields[index].team === this.activeTeam;
    const canBeSelected = index && !!this.fields[index] && !!this.fields[index].piece;
    const nextIndex = !this.selected || this.selected.index !== index ? index : null;

    this.trigger('model:willSelect', nextIndex, canBeSelected);
  }

  didSelect(index: number) {
    if (!index || !this.fields[index]) {
      this.selected = null;

      this.trigger('model:didSelect', null, this.fields);

      return;
    }

    const field = this.fields[index];

    this.selected = {
      index: index,
      field: field,
      possibleMoves: calculatePossibleMoves[field.piece](
        index,
        field,
        this.fields,
        this.history
      )
    };

    this.trigger('model:didSelect', this.selected, this.fields);
  }

  willMove(index: number) {
    if (!this.selected
        || !this.selected.index
        || !this.selected.possibleMoves.includes(index)) {
      this.trigger('model:willMove', index, false);

      return;
    }

    const current: Field = this.selected.field;
    const nextFields: Field[] = preMove(this.selected.index, index, this.fields);
    const kingIndex: number = nextFields.findIndex((next: Field) => next && next.team === current.team && next.piece === KING);
    const canBeMoved: boolean = !isCheck(kingIndex, nextFields[kingIndex], nextFields);

    this.trigger('model:willMove', index, canBeMoved);
  }

  didMove(indexFrom: number, indexTo: number) {
    const field: Field = this.fields[indexFrom];
    const fieldTo: Field = this.fields[indexTo];
    let nextFields = preMove(indexFrom, indexTo, this.fields);

    switch (field.piece) {
      case KING:
        nextFields = this.processKingMiddleware(indexFrom, indexTo, this.fields, nextFields);
        break;
      case PAWN_UP:
      case PAWN_DOWN:
        nextFields = this.processPawnMiddleware(indexFrom, indexTo, this.fields, nextFields);
        break;
    }

    if (fieldTo.piece) {
      this.storage.find((next: HistoryStorage) => next.key === fieldTo.team).values.push({
        piece: fieldTo.piece,
        team: fieldTo.team,
        didUpdate: false
      });
    }

    this.fields = nextFields;

    const enemyKingIndex: number = this.fields.findIndex((next: Field) => next && next.team !== field.team && next.piece === KING);
    const enemyKingField: Field = this.fields[enemyKingIndex];
    const isCheckMateState: boolean = isCheck(enemyKingIndex, enemyKingField, this.fields) &&
                                      isCheckMate(enemyKingIndex, enemyKingField, this.fields);

    this.history.push({
      piece: field.piece,
      team: field.team,
      move: [indexFrom, indexTo]
    });

    this.selected = null;

    this.trigger('model:didMove', isCheckMateState, this.fields, this.storage, this.selected, this.history);
  }

  willPromote(team: Team) {
    if (!team) {
      return;
    }

    this.trigger('model:willPromote', team);
  }

  didPromote(index: number) {
    if (typeof(index) !== 'number') {
      return;
    }

    const lastMove: HistoryAction = this.history[this.history.length - 1];
    const piece: Piece = this.promotePieces[index];
    const indexTo = lastMove.move[1];

    if (!piece) {
      return;
    }

    const field = this.fields[lastMove.move[1]];

    this.storage.find((next: HistoryStorage) => next.key === field.team).values.push({
      piece: field.piece,
      team: field.team,
      didUpdate: false
    });

    field.piece = piece;

    const enemyKingIndex: number = this.fields.findIndex((next: Field) => next && next.team !== field.team && next.piece === KING);
    const enemyKingField: Field = this.fields[enemyKingIndex];
    const isCheckMateState: boolean = isCheck(enemyKingIndex, enemyKingField, this.fields) &&
                                      isCheckMate(enemyKingIndex, enemyKingField, this.fields);

    this.history.push({
      piece: field.piece,
      team: field.team,
      move: [indexTo, indexTo]
    });

    this.selected = null;

    this.trigger('model:didPromote', field.team);
    this.trigger('model:didMove', isCheckMateState, this.fields, this.storage, this.selected, this.history);
  }

  parseSnapshot(value: string = ''): Field {
    const values: string[] = value.split('');

    return {
      piece: values[0] ? (snapshotMapToField.piece[+values[0]] || null) : null,
      team: values[1] ? (snapshotMapToField.team[+values[1]] || null) : null,
      didUpdate:  values[2] ? (snapshotMapToField.didUpdate[+values[2]] || false) : false
    };
  }

  arrangePieces(snapshot: HistorySnapshot) {
    this.fields = this.fields.map((next: Field, index: number) => this.parseSnapshot(snapshot.chessboard[index]));
    this.storage = snapshot.storage.reduce((prev: HistoryStorage[], next: string) => {
      const field: Field = this.parseSnapshot(next);
      const data: HistoryStorage = prev.find((item: HistoryStorage) => item.key === field.team);

      if (!data) {
        prev.push({key: field.team, values: [field]});
      } else {
        data.values.push(field);
      }

      return prev;
    }, <HistoryStorage[]>[]);

    this.trigger('model:didArrange', this.fields, this.storage);
  }

  processKingMiddleware(indexFrom: number, indexTo: number, prevFields: Field[], nextFields: Field[]) {
    switch (indexTo - indexFrom) {
      case 2:
        nextFields = preMove(indexFrom + 4, indexFrom + 1, nextFields);
        break;
      case -2:
        nextFields = preMove(indexFrom -3, indexFrom -1, nextFields);
        break;
    }

    return nextFields;
  }

  processPawnMiddleware(indexFrom: number, indexTo: number, prevFields: Field[], nextFields: Field[]) {
    if (canPawnPromote(indexTo, nextFields[indexTo], nextFields)) {
      this.willPromote(nextFields[indexTo].team);
    } else if (isEnPassantMovePossible(prevFields[indexFrom], prevFields[indexTo], indexFrom, indexTo, this.history)) {
      const lastMove: HistoryAction = this.history[this.history.length - 1];

      nextFields[lastMove.move[1]] = {
        piece: null,
        team: null,
        didUpdate: true
      };
    }

    return nextFields;
  }  
}
