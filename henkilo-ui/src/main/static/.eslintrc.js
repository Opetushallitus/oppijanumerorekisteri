module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // TODO fix stuff
        '@typescript-eslint/no-explicit-any': 1,
        'react/no-deprecated': 1,
        'jsx-a11y/click-events-have-key-events': 1,
        'jsx-a11y/no-static-element-interactions': 1,
        'jsx-a11y/no-autofocus': 1,
        'jsx-a11y/label-has-associated-control': 1,
        'jsx-a11y/no-noninteractive-element-interactions': 1,
    },
};
