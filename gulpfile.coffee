gulp = require "gulp"
zip = require "gulp-zip"
browserify = require "browserify"
babelify = require "babelify"
notify = require "gulp-notify"
source = require "vinyl-source-stream"
forceDeploy = require "gulp-jsforce-deploy"

appName = "LightningReactComponent"

gulp.task "build", ->
  browserify
    entries: [ "./app/scripts/main.js" ]
    standalone: appName

  .transform(babelify)
  .bundle()
  .on "error", ->
    args = Array.prototype.slice.call(arguments)
    notify.onError(title: "Compile Error", message: "<%= error.message %>").apply(@, args);
    @emit "end"
  .pipe source "#{appName}JS.resource"
  .pipe gulp.dest "src/staticresources/"

gulp.task "deploy", ->
  gulp.src "src/**/*", base: "."
    .pipe zip('src.zip')
    .pipe forceDeploy
      username: process.env.SF_USERNAME
      password: process.env.SF_PASSWORD
    .pipe notify('Deploy Completed')

gulp.task "watch", ->
  gulp.watch "app/**/*", [ "build" ]
  gulp.watch "src/**/*", [ "deploy" ]

gulp.task "default", [ "build" ]
