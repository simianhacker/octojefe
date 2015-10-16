var gulp = require('gulp');
var _ = require('lodash');
var path = require('path');
var yargs = require('yargs').argv;
var gulpUtil = require('gulp-util');
var path = require('path');
var mkdirp = require('mkdirp');
var Rsync = require('rsync');
var moment = require('moment');
var Promise = require('bluebird');
var eslint = require('gulp-eslint');
var rimraf = require('rimraf');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var aws = require('aws-sdk');
var fs = require('fs');

var pkg = require('./package.json');
var packageName = pkg.name  + '-' + pkg.version;

var buildDir = path.resolve(__dirname, 'build');
var targetDir = path.resolve(__dirname, 'target');
var buildTarget = path.resolve(buildDir, pkg.name);
var kibanaPluginDir = path.resolve(__dirname, '../kibana/installedPlugins/' + pkg.name);

var include = ['package.json', 'index.js', 'public', 'node_modules', 'server'];
var exclude = Object.keys(pkg.devDependencies).map(function (name) {
  return path.join('node_modules', name);
});

function syncPluginTo(dest, done) {
  mkdirp(dest, function (err) {
    if (err) return done(err);
    Promise.all(include.map(function (name) {
      var source = path.resolve(__dirname, name);
      return new Promise(function (resolve, reject) {
        var rsync = new Rsync();
        rsync
          .source(source)
          .destination(dest)
          .flags('uav')
          .recursive(true)
          .set('delete')
          .exclude(exclude)
          .output(function (data) {
            process.stdout.write(data.toString('utf8'));
          });
        rsync.execute(function (err) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve();
        });
      });
    }))
    .then(function () {
      done();
    })
    .catch(done);
  });
}

gulp.task('sync', function (done) {
  syncPluginTo(kibanaPluginDir, done);
});

gulp.task('lint', function (done) {
  return gulp.src(['server/**/*.js', 'public/**/*.js', 'public/**/*.jsx'])
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.formatEach())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

gulp.task('clean', function (done) {
  Promise.each([buildDir, targetDir], function (dir) {
    return new Promise(function (resolve, reject) {
      rimraf(dir, function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }).nodeify(done);
});

gulp.task('build', ['clean'], function (done) {
  syncPluginTo(buildTarget, done);
});

gulp.task('package', ['build'], function (done) {
  return gulp.src(path.join(buildDir, '**', '*'))
    .pipe(tar(packageName + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest(targetDir));
});

gulp.task('dev', ['sync'], function (done) {
  gulp.watch(['package.json', 'index.js', 'public/**/*', 'server/**/*'], ['sync', 'lint']);
});

