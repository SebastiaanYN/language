import {
  Node, Token, LexicalToken, Program,
} from '../grammar';

import { Diagnostic, Level, ErrorHandler } from '../diagnostic';
import { Span } from '../position';

import { Precedence } from './Precedence';
import {
  declarationRules, expressionRules, statementRules,
  ExpressionParseRule,
} from './parse-rules';

import { expressionStmt } from './internal/statements/expressionStmt';

export class Parser {
  /**
   * The index of the current token
   */
  private index = 0;

  /**
   * The diagnostics reported during parsing
   */
  private readonly diagnostics: Diagnostic[] = [];

  /**
   * The tokens that are being parsed
   */
  private readonly tokens: Token[];

  /**
   * Create a new parser
   *
   * @param tokens - The tokens that need to be parsed
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parse the tokens
   *
   * @returns An AST and zero or more diagnostics. If one or more diagnostics are
   * returned the AST is invalid.
   */
  parse(): {
    ast: Program;
    diagnostics: Diagnostic[];
  } {
    const body: Node[] = [];

    while (!this.isAtEnd()) {
      try {
        body.push(this.declaration());
      } catch {
        this.sync();
      }
    }

    return {
      ast: new Program(body, new Span(
        body.length ? body[0].span.start : [0, 0],
        body.length ? body[body.length - 1].span.end : [0, 0],
      )),
      diagnostics: this.diagnostics,
    };
  }

  /**
   * Parse a declaration or statement
   *
   * @returns A new node
   */
  declaration(): Node {
    const handler = declarationRules[this.peek().type];
    if (handler) {
      this.advance();
      return handler(this);
    }

    return this.statement();
  }

  /**
   * Parse a statement
   *
   * @returns A new node
   */
  statement(): Node {
    const handler = statementRules[this.peek().type];

    if (handler) {
      this.advance();
      return handler(this);
    }

    return expressionStmt(this);
  }

  /**
   * Parse an expression
   *
   * @param msg - A message to display on error
   * @param errorHandler - A handler to assign more info to the error
   * @returns A new node
   */
  expression(msg?: string, errorHandler?: ErrorHandler): Node {
    return this.parsePrecedence(Precedence.OP2, msg, errorHandler);
  }

  parsePrecedence(precedence: Precedence, msg?: string, errorHandler?: ErrorHandler): Node {
    const prefixToken = this.advance();

    const prefixFn = this.getRule(prefixToken.type).prefix;
    if (!prefixFn) {
      throw this.error(msg || 'Expected a declaration, expression, or statement', this.previous().span, errorHandler);
    }

    const prefixNode = prefixFn(this, prefixToken);
    return this.parseInfix(precedence, prefixNode, msg, errorHandler);
  }

  parseInfix(
    precedence: Precedence,
    prefixNode: Node,
    msg?: string,
    errorHandler?: ErrorHandler,
  ): Node {
    let left = prefixNode;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // let ignoredWhitespaceToken: Token | null = null;

      // Break if the next token's precedence is lower than the wanted
      if (precedence > this.getRule(this.peek().type).precedence) {
        break;
        // ignoredWhitespaceToken = this.peekIgnoreWhitespace();
        //
        // if (precedence > this.getRule(ignoredWhitespaceToken.type).precedence) {
        //   break;
        // }
      }

      // let infixRule: ExpressionParseRule;
      // let infixToken: Token;

      // When a token was found after ignoring whitespace check if the rule
      // associated with that token allows ignoring whitespace. If it does trim
      // the whitespace and advance.
      // if (ignoredWhitespaceToken) {
      //   infixRule = this.getRule(ignoredWhitespaceToken.type);
      //
      //   // If the token does not have a prefix rule whitespace can be ignored
      //   if (!infixRule.prefix) {
      //     this.eatWhitespace();
      //     infixToken = this.advance();
      //   } else {
      //     break;
      //   }
      // } else {
      const infixToken = this.advance();
      const infixRule = this.getRule(infixToken.type);
      // }

      if (infixRule.infix) {
        left = infixRule.infix(this, left, infixToken);
      } else {
        throw this.error(msg || `Unexpected token '${this.peek().lexeme}'`, this.peek().span, errorHandler);
      }
    }

    return left;
  }

  /**
   * Get the expression parsing rule for a given token type
   *
   * @param type - The token type
   * @returns The expression parsing rule
   */
  getRule(type: LexicalToken): ExpressionParseRule {
    return expressionRules[type];
  }

  /**
   * Consume a token of a given type. Throws an error if a different type is found.
   *
   * @param type - The token type
   * @param msg - A message to display on error
   * @param errorHandler - A handler to assign more info to the error
   * @returns The consumed token
   */
  consume(type: LexicalToken, msg: string, errorHandler?: ErrorHandler): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(msg, this.peek().span, errorHandler);
  }

  /**
   * Match a token of a given type. If the token matches it is consumed.
   *
   * @param types - The token types
   * @returns Whether a token was matched
   */
  match(...types: LexicalToken[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  /**
   * Move to the next token and returns the previous token
   *
   * @returns The previous token
   */
  advance(): Token {
    if (!this.isAtEnd()) {
      this.index += 1;
    }

    return this.previous();
  }

  /**
   * Check for a token with the given type at the given offset without consuming it
   *
   * @param type - The token type
   * @param offset - The offset to check at
   * @returns Whether the token is at the given offset
   */
  check(type: LexicalToken, offset = 0): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    return this.peek(offset).type === type;
  }

  /**
   * Whether the parser is at the end of the tokens, indicated an `EOF` token
   *
   * @returns Whether the parser is at the end
   */
  isAtEnd(): boolean {
    return this.peek().type === LexicalToken.EOF;
  }

  /**
   * Peek at the token at the provided offset
   *
   * @param offset - The offset to peek at
   * @returns The token at the offset
   */
  peek(offset = 0): Token {
    return this.tokens[this.index + offset];
  }

  /**
   * Get the previous token of the parser
   *
   * @returns The previous token
   */
  previous(): Token {
    return this.peek(-1);
  }

  /**
   * Report an error
   *
   * @param msg - The error message
   * @param span - The span of the error
   * @param errorHandler - A handler to assign more info to the error
   */
  error(msg: string, span: Span, errorHandler?: ErrorHandler): Error {
    const diagnostic = new Diagnostic(Level.ERROR, 'parser', msg, span);
    this.diagnostics.push(diagnostic);

    if (errorHandler) {
      errorHandler(diagnostic);
    }

    return new Error(msg);
  }

  /**
   * Sync the parser. This skips over tokens until a keyword is found that could
   * safely be parsed again, without giving incorrect errors.
   */
  sync(): void {
    while (!this.isAtEnd()) {
      switch (this.peek().type) {
        case LexicalToken.CLASS:
        case LexicalToken.SWITCH:
        case LexicalToken.FUNCTION:
        case LexicalToken.IMPORT:
        case LexicalToken.FOR:
        case LexicalToken.WHILE:
        case LexicalToken.RETURN:
        case LexicalToken.VAR:
          return;
        default:
          this.advance();
      }
    }
  }
}
