import typescriptEslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier'
    ),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            react,
        },

        languageOptions: {
            parser: tsParser,
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        rules: {
            'jsx-a11y/click-events-have-key-events': 1,
            'jsx-a11y/no-autofocus': 1,
            'jsx-a11y/no-noninteractive-element-interactions': 1,
            '@typescript-eslint/no-explicit-any': 1,
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        // Note: there should be no other properties in this object
        ignores: [
            'build/*',
            'src/react-app-env.d.ts',
            'coverage/*',
            'node_modules/*',
            'playwright-results/*',
            'eslint.config.js',
            'webpack.config.js',
            'mock-api/*',
        ],
    },
];
