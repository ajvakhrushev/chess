import { Observer } from 'scripts/Observer';
import { Field } from 'scripts/Field';
import { Team, WHITE, BLACK } from 'scripts/Team';
import { pieceViewMap, QUEEN, KNIGHT, ROOK, BISHOP } from 'scripts/Piece';
import { HistoryAction, HistoryStorage } from 'scripts/History';

interface Selected {
  index: number;
  field: Field;
  possibleMoves: number[];
}

interface Storage {
  key: Team,
  value?: HTMLElement | null,
  values?: HTMLElement[]
};

export class View extends Observer {

  chessboard: HTMLElement | null;
  fieldsContainer: HTMLElement | null;
  storage: Storage[];
  promoteContainer: Storage[] = [];
  fields: HTMLElement[] = [];
  storageFields: Storage[] = [];
  promoteFields: Storage[] = [];
  selected: Selected;
  isActionAllowed: boolean = false;

  constructor(selector: string) {
    super();

    this.chessboard = document.querySelector(selector);

    if (!this.chessboard) {
      // throw error
      return;
    }

    this.fieldsContainer = this.chessboard.querySelector('.chessboard-container .chessboard-fields');

    this.storageFields.push({key: WHITE, value: this.chessboard.querySelector('.chessboard-storage.team-white .chessboard-fields')});
    this.storageFields.push({key: BLACK, value: this.chessboard.querySelector('.chessboard-storage.team-black .chessboard-fields')});
    this.promoteContainer.push({key: WHITE, value: this.chessboard.querySelector('.chessboard-promote.team-white .chessboard-fields')});
    this.promoteContainer.push({key: BLACK, value: this.chessboard.querySelector('.chessboard-promote.team-black .chessboard-fields')});

    this.fieldsContainer.addEventListener('click', this.onChessboardClick.bind(this));

    this.promoteContainer.forEach((next: Storage) => {
      next.value && next.value.addEventListener('click', this.onPromoteContainerClick(next.key).bind(this));
    });

    this.render();

    setTimeout(() => this.chessboard.style.display = '', 0);
  }

  didArrange(fields: Field[], storage: HistoryStorage[]) {
    this.render(fields);

    storage.forEach((next: HistoryStorage) => {
      this.renderPromote(next.key);
      this.renderStorage(next)
    });
  }

  willSelect(index: number) {
    if (!index) {
      return;
    }

    this.isActionAllowed = false;

    this.trigger('view:willSelect', index);
  }

  select(index: number, canBeSelected: boolean) {
    if (!canBeSelected) {
      this.isActionAllowed = true;

      return;
    }

    if (!index) {
      if (this.selected) {
        this.fields[this.selected.index].classList.remove('state-selected');
      }
    } else {
      this.fields[index].classList.add('state-selected');
    }

    this.trigger('view:didSelect', index);
  }

  didSelect(selected: Selected, fields: Field[]) {
    this.selected = selected || null;

    this.render(fields);

    this.isActionAllowed = true;
  }

  willMove(index: number) {
    if (!index) {
      return;
    }

    this.isActionAllowed = false;

    this.trigger('view:willMove', index);
  }

  move(index: number, canBeMoved: boolean) {
    if (!canBeMoved) {
      this.isActionAllowed = true;

      return;
    }

    const field = this.selected.field;

    this.fields[this.selected.index].innerHTML = '';
    this.fields[index].innerHTML = pieceViewMap[field.team][field.piece];

    this.trigger('view:didMove', this.selected.index, index);
  }

  didMove(isCheckMate: boolean, fields: Field[], storage: HistoryStorage[], selected: Selected, history: HistoryAction[]) {
    this.selected = selected || null;

    this.render(fields);

    storage.forEach((next: HistoryStorage) => this.renderStorage(next));

    this.isActionAllowed = !isCheckMate;

    if (isCheckMate) {
      this.end(history[history.length - 1].team);
    }
  }

  end(team: Team) {
    // "team won" code
  }

  willPromote(team: Team) {
    const data = this.promoteContainer.find((next: Storage) => next.key === team);

    if (!data || !data.value) {
      return;
    }

    this.isActionAllowed = false;

    data.value.classList.add('visible');
  }

  didPromote(team: Team) {
    const data = this.promoteContainer.find((next: Storage) => next.key === team);

    this.isActionAllowed = true;

    if (!data || !data.value) {
      return;
    }

    data.value.classList.remove('visible');
  }

  render(fields: Field[] = []) {
    const html = [];
    let isBlack = true;

    for (let i = 80, iMin = 10; i >= iMin; i-=10) {
      isBlack = !isBlack;

      for (let j = 8, jMin = 1; j >= jMin; j-=1) {
        const index = i + j;
        const field = fields[index];
        const classList: string[] = this.buildCellClassList(index, isBlack);

        isBlack = !isBlack;

        html.push(`
          <div class="${classList.join(' ')}" data-index="${index}">
            ${field && field.piece ? pieceViewMap[field.team][field.piece] : ''}
            ${index}
          </div>
        `);
      }
    }

    if (!this.fieldsContainer) {
      return;
    }

    this.fieldsContainer.innerHTML = html.join('');

    const fieldNodes = this.fieldsContainer.querySelectorAll('div') || <HTMLElement[]>[];

    this.fields = Array.prototype.reduce.apply(fieldNodes, [this.onFieldsReduce, <HTMLElement[]>[]]);

    this.isActionAllowed = true;
  }

  renderPromote(team: Team) {
    const storage: Storage = this.promoteContainer.find((next: Storage) => next.key === team);
    const storageFields: Storage = this.promoteFields.find((item: Storage) => item.key === team);

    storage.value.innerHTML = `
      <div>${pieceViewMap[team][QUEEN]}</div>
      <div>${pieceViewMap[team][KNIGHT]}</div>
      <div>${pieceViewMap[team][ROOK]}</div>
      <div>${pieceViewMap[team][BISHOP]}</div>
    `;

    const fieldNodes = storage.value.querySelectorAll('div') || <HTMLElement[]>[];
    const fields: HTMLElement[] = Array.prototype.slice.apply(fieldNodes);

    if (!storageFields) {
      this.promoteFields.push({key: team, values: fields});
    } else {
      storageFields.values = fields;
    }
  }

  renderStorage(data: HistoryStorage) {
    const storage: Storage = this.storageFields.find((item: Storage) => item.key === data.key);
    const html: string[] = data.values.reduce((prev: string[], next: Field) => {
      prev.push(`<div>${pieceViewMap[next.team][next.piece]}</div>`);

      return prev;
    }, <string[]>[]);

    storage.value.innerHTML = html.join('');
  }

  onFieldsReduce(prev: HTMLElement[], next: HTMLElement, index: number): HTMLElement[] {
    const key = next.dataset.index ? +next.dataset.index : null;

    if (!!key) {
      prev[key] = next;
    }

    return prev;
  }

  buildCellClassList(index: number, isBlack: boolean): string[] {
    const list: string[] = isBlack ? ['color-black'] : ['color-white'];

    if (!this.selected) {
      return list;
    }

    if (this.selected.index === index) {
      list.push('state-selected');
    }

    if (this.selected.possibleMoves.includes(index)) {
      list.push('state-possible-move');
    }

    return list;
  }

  onChessboardClick(event: MouseEvent) {
    if (!this.isActionAllowed) {
      return;
    }

    const index = this.fields.findIndex((next: HTMLElement) => next === event.target);

    if (!this.selected || this.selected.index === index) {
      this.willSelect(index);
    } else {
      this.willMove(index);
    }
  }

  onPromoteContainerClick(team: Team) {
    return (event: MouseEvent) => {
      const storage: Storage = this.promoteFields.find((next: Storage) => next.key === team);
      const index: number = storage && storage.values && storage.values.indexOf(<HTMLElement>event.target);

      if (typeof(index) !== 'number' || index === -1) {
        return;
      }

      this.trigger('view:didPromote', index);
    }
  }

}