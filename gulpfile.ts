// tslint:disable: no-unsafe-any
const gulp         = require("gulp");
const lesshint     = require("gulp-lesshint");
const less         = require("gulp-less");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS     = require("gulp-clean-css");
const banner       = require("gulp-banner");
const rename       = require("gulp-rename");
const watch        = require("gulp-watch");
const run          = require("gulp-run");
const connect      = require("gulp-connect");
const tslint       = require("tslint");
import gulpTslint from "gulp-tslint";
const runSequence  = require("gulp4-run-sequence");
const pump         = require("pump");
const webpack      = require("webpack");
const gulpWebpack  = require("webpack-stream");
const UglifyJs     = require("uglifyjs-webpack-plugin");

const pkg = require("./package.json");
const comment = `/*!
* ${pkg.title} v${pkg.version} (${pkg.homepage})
* Copyright ${new Date().getFullYear()} ${pkg.author}
* Licensed under ${pkg.license} (${pkg.repository.url}/blob/master/LICENSE)
*/
`;

const uglifyOptions = {
  sourceMap: true,
  toplevel: true,
  warnings: true,
  compress: {
    passes: 2,
    toplevel: true,
    warnings: true
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
    .pipe(gulpTslint({ program }))
    .pipe(gulpTslint.report({
      emitError: false,
      summarizeFailureOutput: true
    }));
});

gulp.task("ts", () =>
  gulp.src("./ts/**/*.ts")
    .pipe(gulpWebpack({
      mode: "production",
      devtool: "source-map",
      entry: `./ts/${pkg.name}.ts`,
      output: { filename: `${pkg.name}.min.js` },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
      },
      module: {
        rules: [
          { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ]
      },
      optimization: {
        minimizer: [
          new UglifyJs({ uglifyOptions })
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
  watch("./ts/**/*.ts", (callback) =>
    runSequence(
      "tslint",
      "ts",
      callback
    )
  )
);

gulp.task("watch-less", () =>
  watch("./less/*.less", (callback) =>
    runSequence(
      "lesshint",
      "less",
      "minify-css",
      callback
    )
  )
);

gulp.task("watch-html", () =>
  gulp.watch(["./_site/**/*.html"], gulp.series("html"))
);

gulp.task("watch-jekyll", () =>
  gulp.watch(["./*", "_drafts/*", "_includes/*", "_layouts/*", "_posts/*", "apps/*", "attach/*", "css/*", "fonts/*", "img/*", "js/*", "json/*"], gulp.series("jekyll"))
);

gulp.task("watch", (callback) =>
  runSequence(
    ["watch-ts", "watch-less", "watch-html", "watch-jekyll"],
    callback
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
      entry: "./js/tcupdate.js",
      output: { filename: "tcupdate.min.js" },
      optimization: {
        minimizer: [
          new UglifyJs({ uglifyOptions })
        ]
      }
    }, webpack))
    .pipe(banner(comment))
    .pipe(gulp.dest("./js"))
);

gulp.task("minify-css-tcupdate", () =>
  gulp.src("./css/tcupdate.css")
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(banner(comment))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./css"))
);

gulp.task("tcupdate", (callback) =>
  runSequence(
    "less-tcupdate",
    "minify-js-tcupdate",
    "minify-css-tcupdate",
    callback
  )
);

// #endregion

gulp.task("build", (callback) =>
  runSequence(
    ["lesshint", "tslint"],
    ["less", "ts", "tcupdate"],
    ["minify-css"],
    callback
  )
);

gulp.task("default", (callback) =>
  runSequence(
    "build",
    "jekyll",
    ["connect", "watch"],
    callback
  ));
