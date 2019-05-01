/* eslint-disable prefer-arrow-callback, func-names, max-len */

import Syntek from './Syntek';
import DataType from './structures/DataType';

console.warn('Interpreter start');

const syntek: Syntek = new Syntek();

syntek.globalContext.declareVariable('print', DataType.FUNCTION, syntek.literalHandler.function(
  syntek.globalContext,
  'print',
  [{ type: DataType.ANY, name: 'item' }],
  function () {
    console.log(this.getVariable('item').toString());
  },
  DataType.ANY,
));

syntek.createProgram(function () {
  syntek.literalHandler.repeat(this, syntek.literalHandler.number(5), function () {
    this.getVariable('print').exec([syntek.literalHandler.number(123)]);
  });
});

console.warn('Interpreter end');