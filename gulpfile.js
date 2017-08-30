const gulp = require('gulp');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pump = require('pump');

gulp.task('default', () => {

	pump([
		browserify({
			entries: 'public/js/main.js',
			debug: false
		}).bundle(),
		source('bundle.js'),
		buffer(),
		// Uglify function
		// uglify(),
		gulp.dest('public/dist/js')
	]);

});

gulp.task('build', () => {
	pump([
		browserify({
			entries: 'public/js/main.js',
			debug: false
		}).bundle(),
		source('bundle.js'),
		buffer(),
		gulp.dest('public/dist/js')
	]);
});

// Watch files to continue run
// gulp.watch('public/js/*.js', ['default']);
