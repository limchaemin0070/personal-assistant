module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'airbnb',
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
    },
    plugins: [
        'react',
        'react-hooks',
        'react-refresh',
        '@typescript-eslint',
        'prettier',
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'prettier/prettier': 'error',
        'import/extensions': 'off',
        'import/no-absolute-path': 'off',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: ['**/*.config.ts', '**/*.config.js'],
            },
        ],
    },
    ignorePatterns: ['dist', 'node_modules'],
    overrides: [
        {
            files: ['*.cjs', '*.js'],
            parserOptions: {
                project: null,
            },
        },
    ],
};
