import { ElementFinder, browser, by, element } from 'protractor';
import { testWhiteKingMoves, testBlackKingMoves } from './test.snapshots';

describe('Chess - basic stuffs', function() {
  browser.driver.get('http://localhost:8080');

  it('White King should move', function() {
    // browser.driver.chess.model.

    expect(browser).toBeTruthy();
    // expect(browser.chess).toBeTruthy();
  });
});