let gulp = require('gulp');
let uglify = require('gulp-uglify');
let browserify = require('browserify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let pump = require('pump');

gulp.task('default', () => {

	pump([
		browserify({
			entries: 'public/js/main.js',
			debug: false
		}).bundle(),
		source('bundle.js'),
		buffer(),
		// uglify(),
		gulp.dest('public/dist/js')
	]);

});

gulp.watch('public/js/*.js', ['default']);
