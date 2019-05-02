module.exports = {
	'env': {
		'browser': true,
		'es6': true,
		'node': true,
		'jquery': true,
		'jest': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'globals': {
		"gapi": true, // Sets Google API (gapi) as a global to avoid undefined error
		"describe": true, // Sets describe and true to avoid undefined error when testing
		"test": true
	},
	'rules': {
		'no-console':
			'off', // Off since server logs user activity to server console
		'no-unused-vars':
			'off', // Off since some functions defined in index.js are only called in index.html, so appear to be unused
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	}
};
