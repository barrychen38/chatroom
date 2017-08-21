let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let pump = require('pump');
let browserify = require('browserify');
let vinylSourceStream = require('vinyl-source-stream');

gulp.task('dev', () => {

	pump([
		browserify({
			entries: 'public/js/main.js',
			debug: true
		}).bundle(),
		vinylSourceStream('bundle.js'),
		gulp.dest('public/dist/js')
	]);

});

gulp.task('build', () => {

	pump([
		$.concat('app.js'),
		$.uglify(),
		$.rename({
			suffix: '.min'
		}),
		gulp.dest('public/dist/js')
	]);

});

gulp.watch('public/js/*', ['dev']);
