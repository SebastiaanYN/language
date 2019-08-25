import {
  Node, Token, LexicalToken, ClassDeclaration, VariableType,
} from '../../../grammar';

import { Parser } from '../..';
import { Span } from '../../../position';
import { matchGenericParams, matchTypeDecl } from '../../parse-utils';

import { variableDecl } from './variableDecl';

export function classDecl(parser: Parser): Node {
  const classSpan = parser.previous().span;
  parser.eatWhitespace();

  const identifier = parser.consume(LexicalToken.IDENTIFIER, "Expected an identifier after 'class'", (error) => {
    error.info('Add an identifier after this class', classSpan);
  });

  let genericParams: Token[] = [];
  if (parser.matchIgnoreWhitespace(LexicalToken.LT)) {
    genericParams = matchGenericParams(parser);
  }

  const extend: VariableType[] = [];
  if (parser.matchIgnoreWhitespace(LexicalToken.EXTENDS)) {
    do {
      parser.eatWhitespace();
      extend.push(matchTypeDecl(parser));

      if (parser.peekIgnoreWhitespace().type === LexicalToken.COMMA) {
        parser.eatWhitespace();
      }
    } while (parser.match(LexicalToken.COMMA));
  }

  parser.consume(LexicalToken.NEWLINE, 'Expected a newline and indent after the class signature');
  parser.syncIndentation();
  parser.consume(LexicalToken.INDENT, 'Expected a newline and indent after the class signature');

  const staticBody: Node[] = [];
  const instanceBody: Node[] = [];
  while (!parser.match(LexicalToken.OUTDENT)) {
    const isStatic = parser.match(LexicalToken.STATIC);

    let body: Node[];
    if (isStatic) {
      parser.eatWhitespace();
      body = staticBody;
    } else {
      body = instanceBody;
    }

    // Check if it's a variable declaration
    // A class body can contain an empty declaration
    if (parser.match(LexicalToken.VAR)) {
      body.push(variableDecl(parser, true));
    } else {
      body.push(parser.declaration());
    }
  }

  return new ClassDeclaration(
    identifier,
    genericParams,
    extend,
    staticBody,
    instanceBody,
    new Span(classSpan.start, parser.previous().span.end),
  );
}