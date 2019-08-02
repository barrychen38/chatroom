const gulp = require('gulp');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pump = require('pump');

gulp.task('browserify', () => {

	pump([
		browserify({
			entries: './public/js/main.js',
			debug: false
		}).bundle(),
		source('bundle.js'),
		buffer(),
		uglify(),
		gulp.dest('./public/dist/js')
	]);

});

gulp.task('sass', () => {

	pump([
		gulp.src('./public/sass/*.scss'),
		plumber(),
		sourcemaps.init(),
		sass({outputStyle: 'compressed'}),
		sourcemaps.write('./'),
		gulp.dest('./public/dist/css')
	]);

});

gulp.task('dev', ['browserify', 'sass']);

// Watch files to continue run

gulp.watch('./public/js/*.js', ['browserify']);
gulp.watch('./public/sass/*.scss', ['sass']);
