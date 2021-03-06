import {
  Node, LexicalToken,
  GenericParam, VariableType, Parameter,
  Identifier, MemberExpression,
} from '../grammar';

import { Parser } from '.';
import { Span } from '../position';

/**
 * Match a variable location
 *
 * @see https://docs.syntek.dev/spec/grammar/syntactic/#variable-location
 *
 * @param parser - The parser object
 * @returns An identifier or member expression
 */
export function matchVarLoc(parser: Parser): Identifier | MemberExpression {
  const identifier = parser.consume(LexicalToken.IDENTIFIER, 'Expected an identifier');
  let node: Identifier | MemberExpression = new Identifier(identifier);

  while (parser.matchIgnoreNewline(LexicalToken.DOT)) {
    parser.ignoreNewline();

    const prop = parser.consume(LexicalToken.IDENTIFIER, 'Expected an identifier after the "."');
    node = new MemberExpression(node, prop, new Span(node.span.start, prop.span.end));
  }

  return node;
}

/**
 * Match generic parameters. Assumes `<` is already consumed
 *
 * @see https://docs.syntek.dev/spec/grammar/syntactic/#generic-parameters
 *
 * @param parser - The parser object
 * @returns A list of parameters in the generic
 */
export function matchGenericParams(parser: Parser): GenericParam[] {
  const params: GenericParam[] = [];
  parser.ignoreNewline();

  do {
    const identifier = parser.consume(LexicalToken.IDENTIFIER, 'Expected an identifier');
    parser.ignoreNewline();

    let extend: VariableType | undefined;
    if (parser.match(LexicalToken.EXTENDS)) {
      parser.ignoreNewline();
      extend = matchTypeDecl(parser); // eslint-disable-line @typescript-eslint/no-use-before-define
      parser.ignoreNewline();
    }

    params.push(new GenericParam(
      identifier,
      extend,
      new Span(identifier.span.start, parser.previous().span.end),
    ));

    // If the next token is not `>` there should be a comma
    // The comma can also be a trailing comma
    if (!parser.check(LexicalToken.GT)) {
      parser.consume(LexicalToken.COMMA, 'Expected "," or ">"');
      parser.ignoreNewline();
    }
  } while (!parser.match(LexicalToken.GT));

  return params;
}

/**
 * Match generic arguments. Assumes `<` is already consumed
 *
 * @see https://docs.syntek.dev/spec/grammar/syntactic/#generic-arguments
 *
 * @param parser - The parser object
 * @returns A list of variable types that are in the generic
 */
export function matchGenericArgs(parser: Parser): VariableType[] {
  const types: VariableType[] = [];
  parser.ignoreNewline();

  do {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    types.push(matchTypeDecl(parser));
    parser.ignoreNewline();

    // If the next token is not `>` there should be a comma
    // The comma can also be a trailing comma
    if (!parser.check(LexicalToken.GT)) {
      parser.consume(LexicalToken.COMMA, 'Expected "," or ">"');
      parser.ignoreNewline();
    }
  } while (!parser.match(LexicalToken.GT));

  return types;
}

/**
 * Match a type declaration
 *
 * @see https://docs.syntek.dev/spec/grammar/syntactic/#type
 *
 * @param parser - The parser object
 * @returns A variable type
 */
export function matchTypeDecl(parser: Parser): VariableType {
  const varLoc = matchVarLoc(parser);

  // Parse generics
  let generics: VariableType[] = [];
  if (parser.matchIgnoreNewline(LexicalToken.LT)) {
    generics = matchGenericArgs(parser);
  }

  // Check for array brackets
  let arrayDepth = 0;
  while (parser.match(LexicalToken.L_SQB)) {
    parser.ignoreNewline();

    parser.consume(LexicalToken.R_SQB, 'Expected "]" after "["');
    arrayDepth += 1;
  }

  return new VariableType(
    varLoc,
    generics,
    arrayDepth,
    new Span(varLoc.span.start, parser.previous().span.end),
  );
}

/**
 * Match a list of params. Assumes `(` is already consumed
 *
 * @param parser - The parser object
 * @returns An array of function params
 */
export function matchParamList(parser: Parser): Parameter[] {
  const params: Parameter[] = [];
  parser.ignoreNewline();

  while (!parser.match(LexicalToken.R_PAR)) {
    const name = parser.consume(LexicalToken.IDENTIFIER, 'Expected param name');

    parser.ignoreNewline();
    parser.consume(LexicalToken.COLON, "Expected ':' after param name");
    parser.ignoreNewline();

    const variableType = matchTypeDecl(parser);

    params.push(new Parameter(
      name,
      variableType,
      variableType ? new Span(name.span.start, variableType.span.end) : name.span,
    ));

    parser.ignoreNewline();
    if (!parser.check(LexicalToken.R_PAR)) {
      parser.consume(LexicalToken.COMMA, 'Expected ","');

      parser.ignoreNewline();
    }
  }

  return params;
}

/**
 * Match a list of expressions, separated by `,`. Matches until the `closingToken` is reached.
 * Assumes the opening token is already consumed
 *
 * @param parser - The parser object
 * @param closingToken - The type of the closing token
 * @returns An array of expressions
 */
export function matchExpressionList(parser: Parser, closingToken: LexicalToken): Node[] {
  const expressions: Node[] = [];
  parser.ignoreNewline();

  while (!parser.match(closingToken)) {
    expressions.push(parser.expression('Expected list of expressions'));
    parser.ignoreNewline();

    if (!parser.check(closingToken)) {
      parser.consume(LexicalToken.COMMA, 'Expected ","');
      parser.ignoreNewline();
    }
  }

  return expressions;
}

export function matchBlock(parser: Parser): Node[] {
  const ignoreAllNewlines = parser.ignoreAllNewlines;
  parser.ignoreAllNewlines = false; // eslint-disable-line no-param-reassign

  parser.ignoreNewline();
  parser.consume(LexicalToken.L_BRACE, "Expected '{'");
  parser.ignoreNewline();

  const body: Node[] = [];
  while (!parser.match(LexicalToken.R_BRACE)) {
    body.push(parser.declaration());
  }

  parser.ignoreAllNewlines = ignoreAllNewlines; // eslint-disable-line no-param-reassign

  return body;
}
