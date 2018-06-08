const gulp         = require("gulp");
const lesshint     = require("gulp-lesshint");
const less         = require("gulp-less");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS     = require("gulp-clean-css");
const tslint       = require("tslint");
const gulpTslint   = require("gulp-tslint");
const ts           = require("gulp-typescript");
const pump         = require("pump");
const gulpWebpack  = require("webpack-stream");
const webpack      = require("webpack");
const banner       = require("gulp-banner");
const rename       = require("gulp-rename");
const watch        = require("gulp-watch");
const run          = require("gulp-run");
const connect      = require("gulp-connect");
const runSequence  = require("run-sequence");
const UglifyJs     = require("uglifyjs-webpack-plugin");

const pkg          = require("./package.json");
const tsProject    = ts.createProject("./tsconfig.json", {outFile: `${pkg.name}.js`});
const comment      = `/*!
* ${pkg.title} v${pkg.version} (${pkg.homepage})
* Copyright ${new Date().getFullYear()} ${pkg.author}
* Licensed under ${pkg.license} (${pkg.repository.url}/blob/master/LICENSE)
*/
`;

const uglifyOptions = {
  toplevel: true,
  warnings: true,
  compress: {
    passes: 2
  },
  output: {
    ascii_only: true,
    comments: false
  }
};

gulp.task("lesshint", () =>
  gulp.src("./less/*.less")
    .pipe(lesshint({
      configPath: "./.lesshintrc"
    }))
    .pipe(lesshint.reporter())
    .pipe(lesshint.failOnError())
);

gulp.task("less", (callback) => {
  pump([
    gulp.src(`./less/${pkg.name}.less`),
    less(),
    autoprefixer({
      browsers: ["last 2 versions"],
      cascade: false
    }),
    gulp.dest("./css")
  ], callback);
});

gulp.task("minify-css", () => {
  return gulp.src(`./css/${pkg.name}.css`)
    .pipe(cleanCSS({ compatibility: "ie9" }))
    .pipe(banner(comment))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./css"));
});

gulp.task("tslint", () => {
  const program = tslint.Linter.createProgram("./tslint.json");
  return gulp.src("./ts/**/*.ts")
    .pipe(gulpTslint({program}))
    .pipe(gulpTslint.report({
      emitError: false,
      summarizeFailureOutput: true
    }));
});

gulp.task("ts", () =>
  gulp.src("./ts/tc-blog.ts")
    .pipe(gulpWebpack({
      mode: "production",
      devtool: "source-map",
      entry: `./ts/${pkg.name}.ts`,
      output: {filename: `${pkg.name}.min.js`},
      resolve: {extensions: [".ts", ".js"]},
      module: {
        rules: [
          { test: /\.ts$/, use: "ts-loader" }
        ]
      },
      optimization: {
        minimizer: [
          new UglifyJs({uglifyOptions})
        ]
      }
    }, webpack))
    .pipe(banner(comment))
    .pipe(gulp.dest("./js"))
);

gulp.task("jekyll", () =>
  run("bundle exec jekyll build --drafts --incremental").exec()
);

gulp.task("html", () =>
  gulp.src("./_site/**/*.html")
    .pipe(connect.reload())
);

gulp.task("connect", () =>
  connect.server({
    root: "_site",
    port: 4000,
    livereload: true
  })
);

gulp.task("watch-ts", () =>
  watch("./ts/**/*.ts", () =>
    runSequence(
      "tslint",
      "ts"
    )
  )
);

gulp.task("watch-less", () =>
  watch("./less/*.less", () =>
    runSequence(
      "lesshint",
      "less",
      "minify-css"
    )
  )
);

gulp.task("watch-html", () =>
  gulp.watch(["./_site/**/*.html"], ["html"])
);

gulp.task("watch-jekyll", () =>
  gulp.watch(["./*", "_drafts/*", "_includes/*", "_layouts/*", "_posts/*", "apps/*", "attach/*", "css/*", "fonts/*", "img/*", "js/*", "json/*"], ["jekyll"])
);

gulp.task("watch", () =>
  runSequence(
    ["watch-ts", "watch-less", "watch-html", "watch-jekyll"]
  )
);

// #region tcupdate

gulp.task("less-tcupdate", (callback) => {
  pump([
    gulp.src("./less/tcupdate.less"),
    less(),
    autoprefixer({
      browsers: ["last 2 versions"],
      cascade: false
    }),
    gulp.dest("./css")
  ], callback);
});

gulp.task("minify-js-tcupdate", () =>
  gulp.src("./js/tcupdate.js")
  .pipe(gulpWebpack({
    mode: "production",
    output: {filename: "tcupdate.min.js"},
    optimization: {
      minimizer: [
        new UglifyJs({uglifyOptions})
      ]
    }
  }, webpack))
  .pipe(banner(comment))
  .pipe(gulp.dest("./js"))
);

gulp.task("minify-css-tcupdate", () =>
  gulp.src("./css/tcupdate.css")
    .pipe(cleanCSS({compatibility: "ie8"}))
    .pipe(banner(comment))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./css"))
);

gulp.task("tcupdate", () =>
  runSequence(
    "less-tcupdate",
    "minify-js-tcupdate",
    "minify-css-tcupdate"
  )
);

// #endregion

gulp.task("build", () =>
  runSequence(
    ["lesshint", "tslint"],
    ["less", "ts", "tcupdate"],
    ["minify-css"]
  )
);

gulp.task("default", () =>
  runSequence(
    "build",
    "jekyll",
    ["connect", "watch"]
));
