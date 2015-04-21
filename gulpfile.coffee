gulp = require "gulp"
zip = require "gulp-zip"
browserify = require "browserify"
babelify = require "babelify"
through2 = require "through2"
notify = require "gulp-notify"
source = require "vinyl-source-stream"
gutil = require "gulp-util"
forceDeploy = require "gulp-jsforce-deploy"

# disable AMD detection from browserify built UMD file
deamd = () =>
  written = false
  through2.obj (file, enc, callback) ->
    output = new gutil.File(file)
    transform = (data, enc, cb) ->
      unless written
        @push new Buffer("!function(require,define){")
        written = true
      @push data
      cb()
    flush = (cb) ->
      @push new Buffer("}()")
      cb()
    output.contents = file.contents.pipe through2(transform, flush)
    @push(output)
    callback()

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
  .pipe deamd()
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
