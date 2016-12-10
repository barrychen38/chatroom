const gulp = require('gulp');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const pump = require('pump');

const src = ['public/vendor/jquery.min.js', 'public/vendor/socket.io.js', 'public/vendor/uuid.core.js', 'public/vendor/vue.min.js'];

gulp.task('uglify', () => {
	
	pump([
		
		gulp.src(src),
		concat('lib.js'),
		uglify(),
		rename({
			suffix: '.min'
		}),
		gulp.dest('public/dist/js')
		
	]);
	
});