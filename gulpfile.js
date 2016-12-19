const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const pump = require('pump');

const src = ['public/vendor/socket.io.js', 'public/vendor/uuid.core.js', 'public/vendor/vue.min.js', 'public/vendor/axios.min.js'];

gulp.task('uglify', () => {
	
	pump([
		gulp.src(src),
		plugins.concat('lib.js'),
		plugins.uglify(),
		plugins.rename({
			suffix: '.min'
		}),
		gulp.dest('public/dist/js')
	]);
	
});