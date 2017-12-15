
var gulp = require('gulp');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');  //捕捉错误  防止阻塞进程


gulp.task('sass', function () {
	gulp.src('./dev/sass/*.scss')
					// 嵌套输出方式 nested
					// 展开输出方式 expanded
					// 紧凑输出方式 compact
					// 压缩输出方式 compressed
		 .pipe(plumber())
		.pipe(sass({outputStyle:'compressed'}))
		.pipe(gulp.dest('./static/css'))
});


gulp.task('babel',function(){

	return gulp.src('./dev/es6/*js')
	.pipe(babel(
		{
			presets: ['es2015']
		}))
	.pipe(gulp.dest('./static/js'));

	});

gulp.task('watch', function() {
	gulp.watch('./dev/sass/*.scss', ['sass']);
	 gulp.watch('./dev/es6/*.js', ['babel']);
});

gulp.task('default', ['sass','babel','watch']);