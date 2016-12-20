const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const pump = require('pump');

const dev = ['public/vendor/socket.io.js', 'public/vendor/uuid.core.js', 'public/vendor/vue.min.js', 'public/vendor/axios.min.js'];

const build = ['public/vendor/socket.io.js', 'public/vendor/uuid.core.js', 'public/vendor/vue.min.js', 'public/vendor/axios.min.js', 'public/js/chat.js'];

gulp.task('dev', () => {
	
	pump([
		gulp.src(dev),
		plugins.concat('lib.js'),
		plugins.uglify(),
		plugins.rename({
			suffix: '.min'
		}),
		gulp.dest('public/dist/js')
	]);
	
});

gulp.task('build', () => {
	
	pump([
		gulp.src(build),
		plugins.concat('app.js'),
		plugins.uglify(),
		plugins.rename({
			suffix: '.min'
		}),
		gulp.dest('public/dist/js')
	]);
	
});