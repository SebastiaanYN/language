import { Node, LexicalToken, RepeatStatement } from '../../../../grammar';

import { Parser } from '../../..';
import { Span } from '../../../../position';

export function repeatStmt(parser: Parser): Node {
  const start = parser.previous().span.start;
  parser.eatWhitespace();

  const amount = parser.expression('stmt.repeat.expression_after_repeat');
  parser.eatWhitespace();

  parser.consume(LexicalToken.TIMES, 'stmt.repeat.times_after_expression');
  parser.consume(LexicalToken.NEWLINE, 'stmt.repeat.newline_indent_after_times');

  parser.syncIndentation();
  parser.consume(LexicalToken.INDENT, 'stmt.repeat.newline_indent_after_times');

  const body: Node[] = [];
  while (!parser.match(LexicalToken.OUTDENT)) {
    body.push(parser.declaration());
  }

  return new RepeatStatement(amount, body, new Span(start, parser.previous().span.end));
}
