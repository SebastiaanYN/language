import 'mocha';
import { expect } from 'chai';

import { parse, loadRaw } from '../../../test-utils';

import { NumberLiteral } from '../../../../src/grammar/nodes/Expressions';
import { SyntacticToken } from '../../../../src/grammar/SyntacticToken';
import { ExpressionStatement } from '../../../../src/grammar/nodes/Statements';

describe('number', () => {
  it('parses numbers correctly', () => {
    const valid = loadRaw(__dirname, './number.tek');
    const numbers = valid.split('\n').filter(x => x);

    parse(valid).body.forEach((node, i) => {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NumberLiteral;
      expect(expr.type).to.equal(SyntacticToken.NUMBER_LITERAL);
      expect(expr).to.be.an.instanceof(NumberLiteral);
      expect(expr.value.lexeme).to.equal(numbers[i]);
    });
  });
});
