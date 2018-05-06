import { Observer } from './Observer';
import { Field } from './Model';


export class View extends Observer {

  chessboard: HTMLElement | null;
  fieldsContainer: HTMLElement | null;
  fields: HTMLElement[] = [];

  constructor(selector: string) {
    super();

    this.chessboard = document.querySelector(selector);
    this.fieldsContainer = this.chessboard ? this.chessboard.querySelector('.chessboard-container .chessboard-fields') : null;

    this.render();
  }

  onFieldsReduce(prev: HTMLElement[], next: HTMLElement, index: number) {
    const key = next.dataset.index ? +next.dataset.index : null;

    if (!!key) {
      prev[key] = next;
    }

    return prev;
  }

  render(fields: Field[] = []) {
    const html = [];
    let isBlack = false;

    for (let i = 80, iMin = 10; i >= iMin; i-=10) {
      isBlack = !isBlack;

      for (let j = 8, jMin = 1; j >= jMin; j-=1) {
        const className = isBlack ? 'color-black' : 'color-white';

        isBlack = !isBlack;

        html.push(`<div class="${className}" data-index="${i + j}"></div>`);
      }
    }

    if (!this.fieldsContainer) {
      return;
    }

    this.fieldsContainer.innerHTML = html.join('');

    const fieldNodes = this.fieldsContainer.querySelectorAll('div');

    this.fields = Array.prototype.reduce.apply(fieldNodes, [this.onFieldsReduce, <HTMLElement[]>[]]);
  }

}