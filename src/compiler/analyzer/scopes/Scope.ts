import * as grammar from '../../../grammar';

import {
  BlockScope, ClassScope, FunctionScope,
  SymbolTable, SymbolEntry,
} from '../..';

export abstract class Scope {
  readonly node: grammar.Node;

  readonly parent?: Scope;

  readonly table: SymbolTable;

  readonly scopes = new Map<grammar.Node, Scope>();

  constructor(node: grammar.Node, parent?: Scope, table?: SymbolTable) {
    this.node = node;
    this.parent = parent;

    if (table) {
      this.table = table;
    } else if (parent) {
      this.table = new SymbolTable(parent.table);
    } else {
      this.table = new SymbolTable();
    }
  }

  handleNode(node: grammar.Node): void {
    switch (node.type) {
      case grammar.SyntacticToken.VARIABLE_DECL: {
        const decl = node as grammar.VariableDeclaration;

        if (!this.table.has(decl.identifier.lexeme)) {
          this.table.set(decl.identifier.lexeme, new SymbolEntry(node, this));
        }

        break;
      }

      case grammar.SyntacticToken.FUNCTION_DECL: {
        const decl = node as grammar.FunctionDeclaration;

        if (this.table.has(decl.identifier.lexeme)) {
          throw new Error('Name of function already used');
        } else {
          this.table.set(decl.identifier.lexeme, new SymbolEntry(node, this));
          this.scopes.set(node, new FunctionScope(decl, this));
        }

        break;
      }

      case grammar.SyntacticToken.CLASS_DECL: {
        const decl = node as grammar.ClassDeclaration;

        if (this.table.has(decl.identifier.lexeme)) {
          throw new Error('Name of class already used');
        } else {
          this.table.set(decl.identifier.lexeme, new SymbolEntry(node, this));
          this.scopes.set(node, new ClassScope(decl, this));
        }

        break;
      }

      case grammar.SyntacticToken.IMPORT_DECL: {
        const decl = node as grammar.ImportDeclaration;
        const identifier = decl.identifier || decl.source;

        if (this.table.has(identifier.lexeme)) {
          throw new Error('Name of import already used');
        } else {
          this.table.set(identifier.lexeme, new SymbolEntry(node, this));
        }

        break;
      }

      case grammar.SyntacticToken.IF_STMT: {
        const decl = node as grammar.IfStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.ELSE_STMT: {
        const decl = node as grammar.ElseStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.SWITCH_STMT: {
        const decl = node as grammar.SwitchStatement;

        decl.cases.forEach((switchCase) => {
          this.scopes.set(switchCase, new BlockScope(switchCase, this));
        });

        break;
      }

      case grammar.SyntacticToken.FOR_STMT: {
        const decl = node as grammar.ForStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.REPEAT_STMT: {
        const decl = node as grammar.RepeatStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.WHILE_STMT: {
        const decl = node as grammar.WhileStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.TRY_STMT: {
        const decl = node as grammar.TryStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.CATCH_STMT: {
        const decl = node as grammar.CatchStatement;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      case grammar.SyntacticToken.PROGRAM: {
        const decl = node as grammar.Program;
        this.scopes.set(node, new BlockScope(decl, this));
        break;
      }

      default: break;
    }
  }

  buildScopes(): void {
    this.scopes.forEach(scope => scope.build());
  }

  abstract build(): void;
}