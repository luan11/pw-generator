/* Project consts */
const pkg = require('./package.json');
const filesToConcat = require('./filesconcat.json');
const paths = require('./projectpaths.json');
const projectInfo = require(`${paths.dev.root}project-info.json`);

/* Project packages consts */
const gulp = require('gulp');
const webpack = require('webpack');
const webpack_stream = require('webpack-stream');
const webpack_config = require('./webpack.config.js');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const cssmin = require('gulp-cssmin');
const mqGroup = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const imagemin_alt = require('gulp-image');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const htmlReplace = require('gulp-html-replace');
const connect_php = require('gulp-connect-php');
const fs = require('fs');
const terser = require('gulp-terser');
const header = require('gulp-header');
const concat = require('gulp-concat');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');

gulp.task('compilerES:dev', () => {
	return gulp.src(`${paths.dev.scripts}js/main.js`)
	.pipe(plumber())
	.pipe(webpack_stream({
		mode: 'development',
		output: {
			filename: 'bundle.min.js'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
					}
				}
			],
		},
		plugins: [
			new webpack.SourceMapDevToolPlugin({
				filename: 'maps/[file].map'
			})
		]
	}, webpack))
	.pipe(gulp.dest(`${paths.dev.scripts}`))
	.pipe(browserSync.stream());
});

gulp.task('compilerES:prod', () => {
    return webpack_stream(webpack_config)
    .pipe(gulp.dest(`${paths.dev.scripts}`));
});

gulp.task('compilerJS', (done) => {
    if(filesToConcat.files){
        let toConcat = [];

        for(filename in filesToConcat.files){            
            for(let i = 0; i < filesToConcat.files[filename].length; i++){
                toConcat.push(`${paths.dev.scripts}js/${filesToConcat.files[filename][i]}`);   
            }

			gulp.src(toConcat)
			.pipe(plumber())
            .pipe(sourceMaps.init({ loadMaps: true }))
                .pipe(concat(filename))
                .pipe(terser())
            .pipe(sourceMaps.write('./maps'))
			.pipe(gulp.dest(`${paths.dev.scripts}`))
			.pipe(browserSync.stream());

            toConcat = [];
        }
    }else{
		gulp.src(`${paths.dev.scripts}js/**/*.js`)
		.pipe(plumber())
        .pipe(sourceMaps.init({ loadMaps: true }))
            .pipe(concat('bundle.min.js'))
            .pipe(terser())
        .pipe(sourceMaps.write('./maps'))
		.pipe(gulp.dest(`${paths.dev.scripts}`))
		.pipe(browserSync.stream());
    }

    done();
});

gulp.task('compilerSASS', () => {
    let banner = [
        '/*',
        'Theme Name: <%= projectInfo.name %>',
        'Author: <%= projectInfo.author %>',
        'Author URI: <%= projectInfo.author_uri %>',
        'Description: <%= projectInfo.description %>',
        'Version: <%= projectInfo.version %>',
        '*/',
        ''
    ].join('\n');

	return gulp.src(`${paths.dev.scss}style.scss`)
	.pipe(plumber())
    .pipe(sourceMaps.init({ loadMaps: true }))
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(mqGroup())
        .pipe(cssmin())
        .pipe(header(banner, { projectInfo }))
    .pipe(sourceMaps.write('./maps'))
	.pipe(gulp.dest(`${paths.dev.css}`))
	.pipe(browserSync.stream());
});

gulp.task('watcher:ES', (done) => {
    gulp.watch(`${paths.dev.scripts}js/**/*.js`, gulp.series('compilerES:dev'));
    gulp.watch(`${paths.dev.scss}**/*.scss`, gulp.series('compilerSASS'));    
    gulp.watch([`${paths.dev.root}*.html`, `${paths.dev.root}*.php`]).on("change", browserSync.reload);

    done();
});

gulp.task('watcher:JS', (done) => {
    gulp.watch(`${paths.dev.scripts}js/**/*.js`, gulp.series('compilerJS'));
    gulp.watch(`${paths.dev.scss}**/*.scss`, gulp.series('compilerSASS'));    
    gulp.watch([`${paths.dev.root}*.html`, `${paths.dev.root}*.php`]).on("change", browserSync.reload);

    done();
});

gulp.task('generateReadmeToDist', (done) => {
    let readmeStructure = `# ${projectInfo.name}\n\n${projectInfo.description}\n\n__Last change__ > ${new Date()}\n\n__Compiled by__ > ${pkg.name}\n\n__Created by__ > ${projectInfo.author}\n\n*Version __${projectInfo.version}__*\n`;

    fs.writeFileSync(`${paths.dist.root}readme.md`, readmeStructure);

    done();
});

gulp.task('minifyhtml', () => {
    return gulp.src([`${paths.dev.root}*.html`, `${paths.dev.root}*.php`])
    .pipe(htmlReplace({
        js: 'assets/js/bundle.min.js'
    }))
    .pipe(htmlmin({ 
        collapseWhitespace: true,
        ignoreCustomFragments: [ /<%[\s\S]*?%>/, /<\?[=|php]?[\s\S]*?\?>/ ]
    }))
    .pipe(gulp.dest(`${paths.dist.root}`));
});

gulp.task('movescripts', () => {
    return gulp.src(`${paths.dev.scripts}*.js`)
    .pipe(rename(path => {
        path.dirname = "js";
    }))
    .pipe(gulp.dest(`${paths.dist.assets}`));
});

gulp.task('moveassets', (done) => {
	let cmdArgs = process.argv;

    let filesToMove = {
        css: `${paths.dev.css}*.css`,
        fonts: `${paths.dev.assets}fonts/*`,
        images: `${paths.dev.assets}images/*`
    };

    gulp.src(filesToMove.css).pipe(gulp.dest(paths.dist.css));
	gulp.src(filesToMove.fonts).pipe(gulp.dest(`${paths.dist.assets}fonts`));
	
	if(cmdArgs.indexOf('--opt-img') != -1){
		if(cmdArgs.indexOf('--alt') != -1){
			gulp.src(filesToMove.images)
				.pipe(imagemin_alt())
				.pipe(gulp.dest(`${paths.dist.assets}images`));
		}else{
			gulp.src(filesToMove.images)
				.pipe(imagemin())
				.pipe(gulp.dest(`${paths.dist.assets}images`));
		}
	}
	
	done();
});

gulp.task('server', (done) => {
    connect_php.server({
        base: './src'
    }, function(){
        browserSync.init({
            proxy: '127.0.0.1:8000'
        })
    });

    done();
});

gulp.task('default', gulp.series('server', 'watcher:ES'));

gulp.task('js', gulp.series('server', 'watcher:JS'));

gulp.task('precompile', gulp.series('generateReadmeToDist', 'compilerSASS', 'compilerES:prod'));

gulp.task('precompile:js', gulp.series('generateReadmeToDist', 'compilerSASS', 'compilerJS'));

gulp.task('dist', gulp.series('minifyhtml', 'movescripts', 'moveassets'));