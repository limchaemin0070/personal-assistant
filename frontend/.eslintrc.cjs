module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:storybook/recommended'],
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
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                paths: ['.'],
                moduleDirectory: ['node_modules', '.'],
            },
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function',
            },
        ],
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'prettier/prettier': 'error',
        'import/extensions': 'off',
        'import/no-absolute-path': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
        '@typescript-eslint/no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: true,
                allowTaggedTemplates: true,
            },
        ],
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
    },
    ignorePatterns: [
        'dist',
        'node_modules',
        '.eslintrc.cjs',
        'tailwind.config.ts',
        'vite.config.ts',
        'vite_cache',
        '**/*stories*',
        '.storybook',
        '.yarn',
    ],
    overrides: [
        {
            files: ['*.cjs', '*.js'],
            parserOptions: {
                project: null,
            },
        },
    ],
};
