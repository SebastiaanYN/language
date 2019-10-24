import { testRule } from '../rule-tester';

import * as parser from '../../../src/linter/rules/parser';

const ERROR = 'You can only put declarations in a class body';

testRule('declarationsInClass', {
  rules: parser,
  scope: false,

  valid: [
    'class X { var x }',
    'class X { var x = 5 }',
    'class X { function x() { return } }',
    'class X { import x }',
    'class X { class Y { var x } }',
  ],
  invalid: [
    { code: 'class X { 5 }', errors: [ERROR] },
    { code: 'class X { x = 5 }', errors: [ERROR] },
    { code: 'class X { 5 + 10 }', errors: [ERROR] },
    { code: 'class X { if x { y } }', errors: [ERROR] },
    { code: 'class X { for x in y { z } }', errors: [ERROR] },
    { code: 'class X { x \n y }', errors: [ERROR, ERROR] },
  ],
});
