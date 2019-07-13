import 'mocha';
import { expect } from 'chai';

import { parse, loadRaw } from '../../../../test-utils';

import { Node } from '../../../../../src/grammar/Node';
import { Identifier } from '../../../../../src/grammar/nodes/Expressions';
import { SyntacticToken } from '../../../../../src/grammar/SyntacticToken';
import { ExpressionStatement, SwitchStatement } from '../../../../../src/grammar/nodes/Statements';

function checkBody(nodes: Node[]): void {
  const names = ['one', 'two'];

  expect(nodes.length).to.equal(names.length);

  for (let i = 0; i < names.length; i += 1) {
    const stmt = nodes[i] as ExpressionStatement;
    expect(stmt.type).to.equal(SyntacticToken.EXPRESSION_STMT);
    expect(stmt).to.be.an.instanceof(ExpressionStatement);

    const expr = stmt.expression as Identifier;
    expect(expr.type).to.equal(SyntacticToken.IDENTIFIER);
    expect(expr).to.be.an.instanceof(Identifier);
    expect(expr.identifier.lexeme).to.equal(names[i]);
  }
}

describe('switch', () => {
  it('parses single case single condition correctly', () => {
    const program = parse(loadRaw(__dirname, './single-case-single-condition.tek'));

    function check(node: Node): void {
      const stmt = node as SwitchStatement;
      expect(stmt.type).to.equal(SyntacticToken.SWITCH_STMT);
      expect(stmt).to.be.an.instanceof(SwitchStatement);

      const expr = stmt.expression as Identifier;
      expect(expr.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(expr).to.be.an.instanceof(Identifier);
      expect(expr.identifier.lexeme).to.equal('x');

      expect(stmt.cases.length).to.equal(1);

      const firstCase = stmt.cases[0];
      expect(firstCase.conditions.length).to.equal(1);

      const firstCondition = firstCase.conditions[0] as Identifier;
      expect(firstCondition.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(firstCondition).to.be.an.instanceof(Identifier);
      expect(firstCondition.identifier.lexeme).to.equal('y');

      checkBody(firstCase.body);
    }

    program.body.forEach(check);
  });

  it('parses multi case single condition correctly', () => {
    const program = parse(loadRaw(__dirname, './multi-case-single-condition.tek'));

    function check(node: Node): void {
      const stmt = node as SwitchStatement;
      expect(stmt.type).to.equal(SyntacticToken.SWITCH_STMT);
      expect(stmt).to.be.an.instanceof(SwitchStatement);

      const expr = stmt.expression as Identifier;
      expect(expr.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(expr).to.be.an.instanceof(Identifier);
      expect(expr.identifier.lexeme).to.equal('x');

      expect(stmt.cases.length).to.equal(2);

      const firstCase = stmt.cases[0];
      expect(firstCase.conditions.length).to.equal(1);

      const firstCondition = firstCase.conditions[0] as Identifier;
      expect(firstCondition.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(firstCondition).to.be.an.instanceof(Identifier);
      expect(firstCondition.identifier.lexeme).to.equal('y');

      checkBody(firstCase.body);

      const secondCase = stmt.cases[1];
      expect(secondCase.conditions.length).to.equal(1);

      const secondCondition = secondCase.conditions[0] as Identifier;
      expect(secondCondition.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(secondCondition).to.be.an.instanceof(Identifier);
      expect(secondCondition.identifier.lexeme).to.equal('z');

      checkBody(secondCase.body);
    }

    program.body.forEach(check);
  });

  it('parses single case multi condition correctly');

  it('parses multi case multi condition correctly');
});
