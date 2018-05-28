import { getQueryParams } from 'scripts/Utilities';
import { Model } from 'scripts/Model';
import { View } from 'scripts/View';
import { HistorySnapshot } from 'scripts/History';
import * as snapshots from 'scripts/arrangement';

const model = new Model();
const view = new View('#chessboard');

model.on('chessboard:didCreate', view.render, view);
model.on('model:didArrange', view.didArrange, view);

view.on('view:willSelect', model.willSelect, model);
model.on('model:willSelect', view.select, view);
view.on('view:didSelect', model.didSelect, model);
model.on('model:didSelect', view.didSelect, view);

view.on('view:willMove', model.willMove, model);
model.on('model:willMove', view.move, view);
view.on('view:didMove', model.didMove, model);
model.on('model:didMove', view.didMove, view);

model.on('model:willPromote', view.willPromote, view);
view.on('view:didPromote', model.didPromote, model);
model.on('model:didPromote', view.didPromote, view);

const arrangementQueryParam = getQueryParams().find(((next) => next.key === 'arrangement'));
const arrangement = arrangementQueryParam && arrangementQueryParam.value ? arrangementQueryParam.value : '_default';

model.arrangePieces(snapshots[arrangement]);
