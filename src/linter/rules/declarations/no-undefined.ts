import * as grammar from '../../../grammar';

import { LinterRule } from '../..';
import { Level } from '../../../diagnostic';

import { WalkerContext } from '../../../walker';

export const noUndefined: LinterRule = {
  description: 'Report references to undefined variables',
  level: Level.ERROR,
  create(walker, report) {
    function check(node: grammar.Node, ctx: WalkerContext): void {
      if (node.type === grammar.SyntacticToken.IDENTIFIER) {
        const identifier = node as grammar.Identifier;
        const scope = ctx.getScope();

        // If there is no symbol or function with the given name, report it
        if (!scope.hasSymbol(identifier.lexeme) && !scope.hasFunction(identifier.lexeme)) {
          report(`No symbol with the name '${identifier.lexeme}'`, identifier.span);
        }
      }
    }

    walker
      // Declarations
      .onEnter(grammar.VariableDeclaration, (node, ctx) => check(node.value, ctx))

      // Expressions
      .onEnter(grammar.AssignmentExpression, (node, ctx) => {
        check(node.left, ctx);
        check(node.value, ctx);
      })
      .onEnter(grammar.WrappedExpression, (node, ctx) => check(node.expression, ctx))
      .onEnter(grammar.UnaryExpression, (node, ctx) => check(node.right, ctx))
      .onEnter(grammar.BinaryExpression, (node, ctx) => {
        check(node.left, ctx);
        check(node.right, ctx);
      })
      .onEnter(grammar.CallExpression, (node, ctx) => {
        check(node.object, ctx);
        node.params.forEach(param => check(param, ctx));
      })
      .onEnter(grammar.IndexExpression, (node, ctx) => {
        check(node.object, ctx);
        check(node.index, ctx);
      })
      .onEnter(grammar.MemberExpression, (node, ctx) => check(node.object, ctx))
      .onEnter(grammar.NewExpression, (node, ctx) => {
        check(node.object, ctx);
        node.params.forEach(param => check(param, ctx));
      })
      .onEnter(grammar.InstanceofExpression, (node, ctx) => {
        check(node.left, ctx);
        check(node.right, ctx);
      })
      .onEnter(grammar.AsyncExpression, (node, ctx) => check(node.expression, ctx))
      .onEnter(grammar.ArrayExpression, (node, ctx) => {
        node.content.forEach(value => check(value, ctx));
      })
      .onEnter(grammar.IfExpression, (node, ctx) => check(node.condition, ctx))

      // Statements
      .onEnter(grammar.ForStatement, (node, ctx) => check(node.object, ctx))
      .onEnter(grammar.WhileStatement, (node, ctx) => check(node.condition, ctx))
      .onEnter(grammar.ReturnStatement, (node, ctx) => {
        if (node.expression) {
          check(node.expression, ctx);
        }
      })
      .onEnter(grammar.YieldStatement, (node, ctx) => check(node.expression, ctx))
      .onEnter(grammar.ExpressionStatement, (node, ctx) => check(node.expression, ctx))

      // Other
      .onEnter(grammar.VariableType, (node, ctx) => check(node.object, ctx));
  },
};
