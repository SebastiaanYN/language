import * as grammar from '.';

/**
 * Tokens that are a single word
 */
export const WORD_TOKENS: { [key: string]: grammar.LexicalToken } = {
  // Boolean
  true: grammar.LexicalToken.BOOLEAN,
  false: grammar.LexicalToken.BOOLEAN,

  // Keywords
  class: grammar.LexicalToken.CLASS,
  extends: grammar.LexicalToken.EXTENDS,
  new: grammar.LexicalToken.NEW,

  abstract: grammar.LexicalToken.ABSTRACT,
  static: grammar.LexicalToken.STATIC,

  this: grammar.LexicalToken.THIS,
  super: grammar.LexicalToken.SUPER,
  instanceof: grammar.LexicalToken.INSTANCEOF,

  if: grammar.LexicalToken.IF,
  else: grammar.LexicalToken.ELSE,

  function: grammar.LexicalToken.FUNCTION,
  return: grammar.LexicalToken.RETURN,
  void: grammar.LexicalToken.VOID,

  async: grammar.LexicalToken.ASYNC,

  import: grammar.LexicalToken.IMPORT,
  as: grammar.LexicalToken.AS,

  for: grammar.LexicalToken.FOR,
  in: grammar.LexicalToken.IN,
  while: grammar.LexicalToken.WHILE,

  continue: grammar.LexicalToken.CONTINUE,
  break: grammar.LexicalToken.BREAK,
  yield: grammar.LexicalToken.YIELD,

  and: grammar.LexicalToken.AND,
  or: grammar.LexicalToken.OR,

  var: grammar.LexicalToken.VAR,
};

/**
 * Node class mapped to SyntacticToken
 */
export const NODES: Map<typeof grammar.Node, grammar.SyntacticToken> = new Map()
  // Declarations
  .set(grammar.EmptyVariableDeclaration, grammar.SyntacticToken.EMPTY_VARIABLE_DECL)
  .set(grammar.VariableDeclaration, grammar.SyntacticToken.VARIABLE_DECL)
  .set(grammar.EmptyFunctionDeclaration, grammar.SyntacticToken.EMPTY_FUNCTION_DECL)
  .set(grammar.FunctionDeclaration, grammar.SyntacticToken.FUNCTION_DECL)
  .set(grammar.ClassDeclaration, grammar.SyntacticToken.CLASS_DECL)
  .set(grammar.ImportDeclaration, grammar.SyntacticToken.IMPORT_DECL)

  // Expressions
  .set(grammar.AssignmentExpression, grammar.SyntacticToken.ASSIGNMENT_EXPR)
  .set(grammar.WrappedExpression, grammar.SyntacticToken.WRAPPED_EXPR)
  .set(grammar.UnaryExpression, grammar.SyntacticToken.UNARY_EXPR)
  .set(grammar.BinaryExpression, grammar.SyntacticToken.BINARY_EXPR)
  .set(grammar.CallExpression, grammar.SyntacticToken.CALL_EXPR)
  .set(grammar.IndexExpression, grammar.SyntacticToken.INDEX_EXPR)
  .set(grammar.MemberExpression, grammar.SyntacticToken.MEMBER_EXPR)
  .set(grammar.NewExpression, grammar.SyntacticToken.NEW_EXPR)
  .set(grammar.InstanceofExpression, grammar.SyntacticToken.INSTANCEOF_EXPR)
  .set(grammar.AsyncExpression, grammar.SyntacticToken.ASYNC_EXPR)
  .set(grammar.ArrayExpression, grammar.SyntacticToken.ARRAY_EXPR)
  .set(grammar.IfExpression, grammar.SyntacticToken.IF_EXPR)
  .set(grammar.ElseExpression, grammar.SyntacticToken.ELSE_EXPR)

  .set(grammar.Identifier, grammar.SyntacticToken.IDENTIFIER)
  .set(grammar.Super, grammar.SyntacticToken.SUPER)
  .set(grammar.This, grammar.SyntacticToken.THIS)

  .set(grammar.NumberLiteral, grammar.SyntacticToken.NUMBER_LITERAL)
  .set(grammar.StringLiteral, grammar.SyntacticToken.STRING_LITERAL)
  .set(grammar.BooleanLiteral, grammar.SyntacticToken.BOOLEAN_LITERAL)

  // Statements
  .set(grammar.ForStatement, grammar.SyntacticToken.FOR_STMT)
  .set(grammar.WhileStatement, grammar.SyntacticToken.WHILE_STMT)
  .set(grammar.ReturnStatement, grammar.SyntacticToken.RETURN_STMT)
  .set(grammar.YieldStatement, grammar.SyntacticToken.YIELD_STMT)
  .set(grammar.ExpressionStatement, grammar.SyntacticToken.EXPRESSION_STMT)

  .set(grammar.BreakStatement, grammar.SyntacticToken.BREAK_STMT)
  .set(grammar.ContinueStatement, grammar.SyntacticToken.CONTINUE_STMT)

  // Other
  .set(grammar.Program, grammar.SyntacticToken.PROGRAM)
  .set(grammar.VariableType, grammar.SyntacticToken.VARIABLE_TYPE)
  .set(grammar.Parameter, grammar.SyntacticToken.PARAMETER)
  .set(grammar.ClassProp, grammar.SyntacticToken.CLASS_PROP)
  .set(grammar.ImportExpose, grammar.SyntacticToken.IMPORT_EXPOSE);

export function isDeclaration(node: grammar.Node): boolean {
  return node.type >= grammar.SyntacticToken.EMPTY_VARIABLE_DECL
    && node.type <= grammar.SyntacticToken.IMPORT_DECL;
}

export function isExpression(node: grammar.Node): boolean {
  return node.type >= grammar.SyntacticToken.ASSIGNMENT_EXPR
    && node.type <= grammar.SyntacticToken.BOOLEAN_LITERAL;
}

export function isStatement(node: grammar.Node): boolean {
  return node.type >= grammar.SyntacticToken.FOR_STMT
    && node.type <= grammar.SyntacticToken.CONTINUE_STMT;
}

export function isOther(node: grammar.Node): boolean {
  return node.type >= grammar.SyntacticToken.NATIVE_NODE
    && node.type <= grammar.SyntacticToken.IMPORT_EXPOSE;
}

export function isFunction(node: grammar.Node): boolean {
  return node.type === grammar.SyntacticToken.EMPTY_FUNCTION_DECL
    || node.type === grammar.SyntacticToken.FUNCTION_DECL;
}
