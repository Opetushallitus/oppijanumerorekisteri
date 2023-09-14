module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "react"
    ],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        //'plugin:jsx-a11y/recommended', TODO fix stuff
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier',
    ],
    settings: {
        react: {
            version: 'detect',
        }
    },
    rules: {
        // TODO fix stuff
        '@typescript-eslint/no-explicit-any': 1,
        'react/no-deprecated': 1,
    },
};
