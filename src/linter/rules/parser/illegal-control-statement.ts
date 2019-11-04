import * as grammar from '../../../grammar';

import { LinterRule } from '../..';
import { Level } from '../../../diagnostic';

function inLoop(parents: grammar.Node[]): boolean {
  return parents.some(parent => parent.type === grammar.SyntacticToken.FOR_STMT
    || parent.type === grammar.SyntacticToken.WHILE_STMT);
}

export const illegalControlStatement: LinterRule = {
  description: 'Report illegal control statements',
  level: Level.ERROR,
  create(walker, report) {
    walker.onEnter(grammar.ReturnStatement, (node, ctx) => {
      // Return must be inside a function
      const isValid = ctx.parents
        .some(parent => parent.type === grammar.SyntacticToken.FUNCTION_DECL);

      if (!isValid) {
        report('You can only place return inside a function', node.span);
      }
    });

    walker.onEnter(grammar.YieldStatement, (node, ctx) => {
      const isValid = ctx.parents.some(parent => parent.type === grammar.SyntacticToken.IF_EXPR);

      if (!isValid) {
        report('You can only place yield inside an if expression', node.span);
      }
    });

    walker.onEnter(grammar.BreakStatement, (node, ctx) => {
      if (!inLoop(ctx.parents)) {
        report('You can only place break inside a loop', node.span);
      }
    });

    walker.onEnter(grammar.ContinueStatement, (node, ctx) => {
      if (!inLoop(ctx.parents)) {
        report('You can only place continue inside a loop', node.span);
      }
    });
  },
};
