const { preset } = require( '@wordpress/scripts/config/jest-unit.config' );

module.exports = {
	preset,
	collectCoverage: false, // Enable with `--coverage=true` flag.
	collectCoverageFrom: [ 'assets/**/**.js' ],
	coverageDirectory: 'coverage',
	coveragePathIgnorePatterns: [
		'<rootDir>/build/',
		'<rootDir>/node_modules/',
		'<rootDir>/assets/js/googlesitekit-(.*).js',
	],
	coverageReporters: [ 'html', 'text-summary' ],
	rootDir: '../../',
	transform: {
		'^.+\\.[jt]sx?$':
			'<rootDir>/node_modules/@wordpress/scripts/config/babel-transform',
	},
	setupFiles: [
		'<rootDir>/tests/js/setup-globals',
		'jest-localstorage-mock',
	],
	setupFilesAfterEnv: [
		'<rootDir>/tests/js/jest-matchers',
		'<rootDir>/tests/js/setup-before-after',
	],
	testMatch: [
		'<rootDir>/assets/**/__tests__/**/*.js',
		'<rootDir>/assets/**/test/*.js',
		'<rootDir>/assets/**/?(*.)test.js',
		'<rootDir>/packages/**/__tests__/**/*.js',
		'<rootDir>/packages/**/test/*.js',
		'<rootDir>/packages/**/?(*.)test.js',
	],
	testPathIgnorePatterns: [
		'<rootDir>/.git',
		'<rootDir>/node_modules',
		'<rootDir>/build',
	],
	// Matches aliases in webpack.config.js.
	moduleNameMapper: {
		// New (JSR) modules.
		'^googlesitekit-(.+)$': '<rootDir>assets/js/googlesitekit-$1',
		// Necessary mock to prevent test failures caused by SVGR
		'\\.svg$': '<rootDir>/tests/js/svgrMock.js',
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/tests/js/fileMock.js',
	},
};
