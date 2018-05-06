import { Model } from './Model';
import { View } from './View';

const model = new Model();
const view = new View('#chessboard');

model.on('chessboard:didCreate', view.render);
model.on('chessboard:didUpdate', view.render);
model.on('piece:didMove', view.render);

view.on('piece:didChoose', model.pieceCalculateMoves);
view.on('piece:didMove', model.pieceMove);