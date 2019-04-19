import { $ } from '../../../structures/rule';
import { Token, TokenMatcher } from '../../../structures/token';

import tokens from '../../lexing';
import Expression from './Expression';

class LogicalExpression extends Token {
  /**
   * The left hand side of the logical expression
   */
  readonly left: Token;

  /**
   * The operator of the logical expression
   */
  readonly operator: Token;

  /**
   * The right hand side of the logical expression
   */
  readonly right: Token;

  constructor(location, matchedTokens) {
    super(location, matchedTokens);

    this.left = matchedTokens[0];
    this.operator = matchedTokens[1];
    this.right = matchedTokens[2];
  }

  build(): string {
    return '';
  }
}

export default new TokenMatcher(LogicalExpression, $.SEQ(
  Expression,
  $.OR(
    tokens.And,
    tokens.Or,
  ),
  Expression,
));