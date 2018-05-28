import { ElementFinder, browser, by, element } from 'protractor';

const KING_WHITE = '&#9812';
const FIELD_QUERY = '.chessboard-container .chessboard-fields div';

const moveToAllowedFieldFn = (currentField) => (index: number) => {
  if (!index) {
    return;
  }

  let nextField = element(by.css(`${FIELD_QUERY}[data-index="${index}"]`));

  if (!nextField) {
    return;
  }

  currentField.click();
  nextField.click();    

  expect<any>(currentField.getText()).toEqual('');
  expect<any>(nextField.getText()).toEqual(KING_WHITE);

  nextField.click();
  currentField.click();

  expect<any>(currentField.getText()).toEqual(KING_WHITE);
  expect<any>(nextField.getText()).toEqual('');
};

const moveToForbiddenFieldFn = (currentField) => (index: number) => {
  if (!index) {
    return;
  }

  let nextField = element(by.css(`${FIELD_QUERY}[data-index="${index}"]`));

  if (!nextField) {
    return;
  }

  currentField.click();
  nextField.click();

  expect<any>(currentField.getText()).toEqual(KING_WHITE);
  expect<any>(nextField.getText()).toEqual('');
};

const moveToNotExistsFieldFn = (currentField) => (index: number) => {
  if (!index) {
    return;
  }

  let nextField = element(by.css(`${FIELD_QUERY}[data-index="${index}"]`));

  if (!nextField) {
    return;
  }

  currentField.click();
  nextField.click();

  expect<any>(currentField.getText()).toEqual(KING_WHITE);
  expect<any>(nextField.getText()).toEqual('');
};

describe('Chess - basic stuffs', function() {
  it('White King should move', function() {
    browser.driver.get('http://localhost:8080?arrangement=kingMoves');

    const fieldKing = element(by.css(`${FIELD_QUERY}[data-index="45"]`));

    expect<any>(fieldKing.getText()).toEqual(KING_WHITE);

    const moveToAllowedField = moveToAllowedFieldFn(fieldKing);

    moveToAllowedField(55);
    moveToAllowedField(54);
    moveToAllowedField(44);
    moveToAllowedField(34);
    moveToAllowedField(35);
    moveToAllowedField(36);
    moveToAllowedField(46);
    moveToAllowedField(56);

    moveToForbiddenFieldFn(63);
    moveToForbiddenFieldFn(24);
    moveToForbiddenFieldFn(52);
    moveToForbiddenFieldFn(85);
    moveToForbiddenFieldFn(11);
  });
});
