module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:import/recommended',
        //'plugin:jsx-a11y/recommended', TODO fix stuff
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier',
    ],
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        // TODO fix stuff
        '@typescript-eslint/ban-ts-comment': 1,
        'react/no-deprecated': 1,
        'react/jsx-key': 1,
    },
};
