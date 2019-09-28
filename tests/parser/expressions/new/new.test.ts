import 'mocha';
import { expect } from 'chai';

import { parse, loadRaw } from '../../../test-utils';

import { Node } from '../../../../src/grammar/Node';
import { SyntacticToken } from '../../../../src/grammar/SyntacticToken';
import { ExpressionStatement } from '../../../../src/grammar/nodes/Statements';
import { Identifier, NewExpression, MemberExpression } from '../../../../src/grammar/nodes/Expressions';

describe('new', () => {
  it('parses no params correctly', () => {
    const program = parse(loadRaw(__dirname, './no-params.tek'));

    function check(node: Node): void {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NewExpression;

      expect(expr.type).to.equal(SyntacticToken.NEW_EXPR);
      expect(expr).to.be.an.instanceof(NewExpression);
      expect(expr.genericArgs.length).to.equal(0);
      expect(expr.params.length).to.equal(0);

      const object = expr.object as Identifier;
      expect(object.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(object).to.be.an.instanceof(Identifier);
      expect(object.lexeme).to.equal('x');
    }

    program.body.forEach(check);
  });

  it('parses single param correctly', () => {
    const program = parse(loadRaw(__dirname, './single-param.tek'));

    function check(node: Node): void {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NewExpression;

      expect(expr.type).to.equal(SyntacticToken.NEW_EXPR);
      expect(expr).to.be.an.instanceof(NewExpression);
      expect(expr.genericArgs.length).to.equal(0);

      expect(expr.params.length).to.equal(1);

      const param = expr.params[0] as Identifier;
      expect(param.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(param).to.be.an.instanceof(Identifier);
      expect(param.lexeme).to.equal('y');

      const object = expr.object as Identifier;
      expect(object.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(object).to.be.an.instanceof(Identifier);
      expect(object.lexeme).to.equal('x');
    }

    program.body.forEach(check);
  });

  it('parses multi param correctly', () => {
    const program = parse(loadRaw(__dirname, './multi-param.tek'));

    function check(node: Node): void {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NewExpression;

      expect(expr.type).to.equal(SyntacticToken.NEW_EXPR);
      expect(expr).to.be.an.instanceof(NewExpression);
      expect(expr.genericArgs.length).to.equal(0);

      expect(expr.params.length).to.equal(2);

      const firstParam = expr.params[0] as Identifier;
      expect(firstParam.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(firstParam).to.be.an.instanceof(Identifier);
      expect(firstParam.lexeme).to.equal('y');

      const secondParam = expr.params[1] as Identifier;
      expect(secondParam.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(secondParam).to.be.an.instanceof(Identifier);
      expect(secondParam.lexeme).to.equal('z');

      const object = expr.object as Identifier;
      expect(object.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(object).to.be.an.instanceof(Identifier);
      expect(object.lexeme).to.equal('x');
    }

    program.body.forEach(check);
  });

  it('parses member class correctly', () => {
    const program = parse(loadRaw(__dirname, './member-class.tek'));

    function check(node: Node): void {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NewExpression;

      expect(expr.type).to.equal(SyntacticToken.NEW_EXPR);
      expect(expr).to.be.an.instanceof(NewExpression);
      expect(expr.genericArgs.length).to.equal(0);

      expect(expr.params.length).to.equal(0);

      const memberExpr = expr.object as MemberExpression;
      expect(memberExpr.type).to.equal(SyntacticToken.MEMBER_EXPR);
      expect(memberExpr).to.be.an.instanceof(MemberExpression);

      const object = memberExpr.object as Identifier;
      expect(object.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(object).to.be.an.instanceof(Identifier);
      expect(object.lexeme).to.equal('x');

      const property = memberExpr.property;
      expect(property.lexeme).to.equal('y');
    }

    program.body.forEach(check);
  });

  it('parses generic correctly', () => {
    const program = parse(loadRaw(__dirname, './generic.tek'));

    function check(node: Node): void {
      expect(node.type).to.equal(SyntacticToken.EXPRESSION_STMT);
      expect(node).to.be.an.instanceof(ExpressionStatement);

      const expr = (node as ExpressionStatement).expression as NewExpression;

      expect(expr.type).to.equal(SyntacticToken.NEW_EXPR);
      expect(expr).to.be.an.instanceof(NewExpression);

      expect(expr.genericArgs.length).to.equal(1);

      const generic = expr.genericArgs[0];
      expect((generic.object as Identifier).lexeme).to.equal('y');
      expect(generic.generics.length).to.equal(0);
      expect(generic.arrayDepth).to.equal(0);

      expect(expr.params.length).to.equal(0);

      const object = expr.object as Identifier;
      expect(object.type).to.equal(SyntacticToken.IDENTIFIER);
      expect(object).to.be.an.instanceof(Identifier);
      expect(object.lexeme).to.equal('x');
    }

    program.body.forEach(check);
  });
});
