const gtsConfig = require('gts/.prettierrc.json');

module.exports = {
  ...gtsConfig,
  // Override or add custom rules
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
};
