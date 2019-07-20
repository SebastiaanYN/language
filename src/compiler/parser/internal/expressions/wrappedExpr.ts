import {
  Node, Token, LexicalToken, WrappedExpression,
} from '../../../../grammar';

import { Parser } from '../../..';

export function wrappedExpr(parser: Parser, prefix: Token): Node {
  const start = prefix.location.start;
  parser.eatWhitespace();

  const expr = parser.expression('expr.wrapped.expression_after_lpar');
  parser.eatWhitespace();

  parser.consume(LexicalToken.RPAR, 'expr.wrapped.rpar_after_expression');
  const end = parser.previous().location.end;

  return new WrappedExpression(expr, { start, end });
}
