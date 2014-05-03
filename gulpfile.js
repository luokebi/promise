var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');

gulp.task('build',['clean'], function () {
	gulp.src('src/promise.js')
		.pipe(uglify())
		.pipe(rename('promise.min.js'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('clean', function () {
	return gulp.src('dist')
				.pipe(clean());
});