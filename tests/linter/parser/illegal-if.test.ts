import { testRule } from '../rule-tester';

import * as parser from '../../../src/linter/rules/parser';

const ERROR = 'An if expression must have an else body';

testRule('illegalIf', {
  rules: parser,
  scope: false,

  valid: [
    'if x {}',
    'if x {} else {}',
    'if x { if y {} }',
    'if x { if y {} } else { if z {} }',
    'if x {} else if y {} else {}',
    '(if x {} else {})',
    '(if x {} else if y {} else {})',
    'if if x {} else {} {}',
    'for x in if y {} else {} {}',
  ],
  invalid: [
    { code: '(if x {})', errors: [ERROR] },
    { code: '(if x {} else if y {})', errors: [ERROR] },
    { code: 'if if x {} {}', errors: [ERROR] },
    { code: 'if if x {} else if y {} {}', errors: [ERROR] },
    { code: 'for x in if y {} {}', errors: [ERROR] },
    { code: 'for x in if y {} else if z {} {}', errors: [ERROR] },
  ],
});
