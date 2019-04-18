// tslint:disable: no-unsafe-any
const gulp         = require("gulp");
const lesshint     = require("gulp-lesshint");
const less         = require("gulp-less");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS     = require("gulp-clean-css");
const banner       = require("gulp-banner");
const rename       = require("gulp-rename");
const runSequence  = require("gulp4-run-sequence");
const pump         = require("pump");
const webpack      = require("webpack");
const gulpWebpack  = require("webpack-stream");
const UglifyJs     = require("uglifyjs-webpack-plugin");

const pkg = require("./package.json");

const comment = `/*!
* TC Blog build at ${new Date().toISOString()} (https://tautcony.github.io/)
* Copyright ${new Date().getFullYear()} TautCony
* Licensed under Apache-2.0 (https://github.com/tautcony/tautcony.github.io/blob/master/LICENSE)
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

gulp.task("default", (callback) =>
  runSequence(
    "less-tcupdate",
    "minify-js-tcupdate",
    "minify-css-tcupdate",
    callback
  )
);
