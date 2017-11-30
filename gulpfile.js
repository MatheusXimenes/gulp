/// Gulpfile.js
/// This gulpfile is used to coding and to build to dist --> user more to Front End.
/// Note 1: // **/* Globe Pattern --> look all files in all folders after
/// Note 2: 'return' make tasks synchoronous --> as defaultt the tasks are asynchronously
/// Note 3: I use it with Bower --> Bootstrap-sass, fontawesome, jquery, normalize-css ...

/// Main Tasks
/// |- build-dist --> Prepearing Files for Dist
/// |- coding     --> Use this for daily coding

/// Node Modules for Gulp  ///
var gulp            = require('gulp'),
    imagemin        = require('gulp-imagemin'),
    clean           = require('gulp-clean'),
    concat          = require('gulp-concat'),
    htmlReplace     = require('gulp-html-replace'),
    uglify          = require('gulp-uglify'),
    usemin          = require('gulp-usemin'),
    cssmin          = require('gulp-cssmin'),
    htmlmin         = require('gulp-htmlmin'),
    rev             = require('gulp-rev'),
    browserSync     = require('browser-sync').create(),
    jshint          = require('gulp-jshint'),
    jshintStylish   = require('jshint-stylish'),
    csslint         = require('gulp-csslint'),
    autoprefixer    = require('gulp-autoprefixer'),
    less            = require('gulp-less'),
    sass            = require('gulp-ruby-sass'),
    notify          = require('gulp-notify'),
    bower           = require('gulp-bower');

/// Setting Paths on Project ///
var path = {
    src:   'src',
    dist:  'dist',
    bower: 'bower_components',
    fonts: 'fonts'
}


/// Building to Dist ///
/// Main Build Task 0 --> make a copy form src folder to dist folder 
/// Sub Task images-size and usemin (js uglify, css minify and add prefixer to classes)
gulp.task('build-dist', ['copy'], function() {
	gulp.start('images-size', 'usemin', 'htmlmin'); //Start secondary tasks after clean and copy
});

/// Build Task 1 --> to Create Dist Folder
/// Note: Use Default Gulp
gulp.task('copy', ['clean'], function() {
	return gulp.src(path.src +'/**/*')
		.pipe(gulp.dest(path.dist));
}); 
/// Build Task 2 --> to Clean Dist Folder
/// Note: Use Clean Module
gulp.task('clean', function() {
	return gulp.src(path.dist)
		.pipe(clean());
});
/// Build Task 3 --> to Make the images lighter for web
/// Note: Use imagemin Module
gulp.task('images-size', function() {
  return gulp.src(path.dist +'/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [
            {removeViewBox: false},
            {cleanupIDs: false}
        ]
    }))
    .pipe(gulp.dest(path.dist +'/img'));
});
/// Build Task 4 --> to Uglify JS, Minify CSS and Prefixation of CSS Browser
/// Note: Use Uglify, cssmin and autoprefixer Modules
gulp.task('usemin', function() {
    return gulp.src(path.dist +'/**/*.html')
        .pipe(usemin({
            js: [uglify], //Uglify
            css: [autoprefixer, cssmin] //Auto Prefixer and Cssmin
        }))
        .pipe(gulp.dest(path.dist));
});
/// Build Task 5 --> to minify html
/// Note: Use htmlmin
gulp.task('htmlmin', function() {
    return gulp.src(path.dist +'/**/*.html')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(path.dist))
});

/// Optional Task Structure
/// Build Task 6 --> Pull version on files (if chache on server is on)
/// Note: Aply a hash on files to force browser download if they have been modified
gulp.task('rev', function(){
    return gulp.src([path.dist +'/**/*.{css,js,jpg,jpeg,png,svg}'])
      .pipe(rev())
      //.pipe(revdel()) //review this
      .pipe(gulp.dest(path.dist))
      .pipe(rev.manifest())
      .pipe(gulp.dest(path.dist))
});

gulp.task('revreplace', ['rev'], function(){
return gulp.src([path.dist +'/index.html', 'dist/**/*.css'])
    .pipe(revReplace({
        manifest: gulp.src('dist/rev-manifest.json'),
        replaceInExtensions: ['.html', '.js', '.css']
    }))
    .pipe(gulp.dest(path.dist));
});
  


/// coding ///
/// {my default} Run coding task --> Love Code. 'Win'!!! ;P
gulp.task('coding', ['bower', 'code']);

/// Default Task 1 --> Run Bower 'This is Love!'
gulp.task('bower', ['icons'], function() {
    return bower()
        .pipe(gulp.dest(path.bower))
}); 
/// Default Task 2 --> Move Bower Fonts to src folder fonts
gulp.task('icons', function() {
    return gulp.src(path.bower + '/fontawesome/fonts/**.*')
        .pipe(gulp.dest(path.fonts));
});

/// Main task to code Css and Javascript --> If You use live server on your IDE, 'like me'!
/// Run code to Watching SCSS and JS changes on SRC
gulp.task('code', function() {
    gulp.watch(path.src +'/js/**/*.js', ['jshint']);
    gulp.watch(path.sass + '/**/*.scss', ['sass']);
    //|-Or LESS files
    //|-gulp.watch(path.src +'/less/**/*.less', ['less']);
    //|-Or Css files
    //|-gulp.watch(path.src +'/css/**/*.css', ['css']);
});

/// Code Task 1 --> Look for changes on js files and confer the syntax
/// Show error on server log
/// Use jshint and jshintStylish Modules
gulp.task('jshint', function() {
    return gulp.src(path.src +'/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter());
});

/// Watching CSS or LESS or Sass
/// |-Checking syntax, duplicate classes and id use
/// |-Show errors and comments about your css
/// |-Use csslint Module
gulp.task('css', function() {
    return gulp.src(path.src +'/css/**/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
}); 
/// |-Or
/// |-Use less Module
gulp.task('less', function() {
    return gulp.src(path.src +'/less/**/*.less')
        .pipe(less({
            paths: [path.join(path.src+'/less', 'less')]
        }))
        .pipe(gulp.dest(path.src +'/css'));
});
/// |-Or
/// |-Watching for changes on Sass files
/// |-Use sass and notify Modules
gulp.task('sass', function() {
    return sass(path.src +'/scss/**/*.scss')
        .on('error', notify.onError(function(error) {
            console.log('Sass, Error on Compiling: ' + error.filename);
            console.log(error.message);
            return "Error: " + error.message;
        }))
        .pipe(gulp.dest(path.src + '/css'));
});   





/// Big OR ///
/// If you prefer use this live server --> localhost:3000
/// Create a live server to Monitoring Project Changes on src folder
/// Use browserSync Module
gulp.task('server', function() {
    
    //Start Server 
    browserSync.init({
        server: { //Settings
            baseDir: path.src //Run on source folder
        }
    });

    //Watching changes
    //If any file on source folder change than reload again the server
    gulp.watch(path.src +'/**/*').on('change', browserSync.reload);

    //Watching for changes on js files and confer the syntax
    gulp.watch(path.src +'/js/**/*.js', ['jshint']);
    
    //Watching for changes on Sass files
    gulp.watch(path.src +'/scss/**/*.scss', ['sass']);
    //|-Or LESS files
    //|-gulp.watch(path.src +'/less/**/*.less', ['less']);
    //|-Or Css files
    //|-gulp.watch(path.src +'/css/**/*.css', ['css']); 
     
});