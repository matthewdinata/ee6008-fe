module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['react', 'prettier', '@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'prettier',
		'next/core-web-vitals',
	],
	rules: {
		'prettier/prettier': 'error',
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
		'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
		'import/no-extraneous-dependencies': 'off',
		'react/jsx-no-useless-fragment': 'off',
		'react/no-array-index-key': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			},
		],
	},
	overrides: [
		{
			files: ['**/*.tsx'],
			rules: {
				'react/jsx-props-no-spreading': 'off',
			},
		},
	],
};
