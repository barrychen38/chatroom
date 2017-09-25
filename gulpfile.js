const gulp = require('gulp');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const compass = require('gulp-compass');
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

gulp.task('compass', () => {

	pump([
		gulp.src('./public/sass/*.scss'),
		plumber(),
		compass({
			config_file: './config.rb',
			css: './public/dist/css',
			sass: './public/sass'
		}),
		gulp.dest('./public/dist/css')
	]);

});

gulp.task('dev', ['browserify', 'compass']);

// Watch files to continue run
gulp.watch('./public/js/*.js', ['browserify']);
gulp.watch('./public/sass/*.scss', ['compass']);
