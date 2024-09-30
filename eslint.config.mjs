import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
 { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
 { languageOptions: { globals: globals.browser } },
 ...tseslint.configs.recommended,
 pluginReact.configs.flat.recommended,
 {
  rules: {
   'react/react-in-jsx-scope': 'off',
   '@typescript-eslint/no-unused-expressions': 'off',
   '@typescript-eslint/ban-ts-comment': 'off',
   '@typescript-eslint/no-unsafe-function-type': 'off',
   'react/display-name': 'off',
   'react/no-unknown-property': 'off',
   'react/no-unescaped-entities': 'off',
  },
 },
 { ignores: ['.next/'] },
];
