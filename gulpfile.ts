import * as path from "path";
import * as gulp from "gulp";
import * as lesshint from "gulp-lesshint";
import * as less from "gulp-less";
import * as autoprefixer from "gulp-autoprefixer";
import * as cleanCSS from "gulp-clean-css";
import * as banner from "gulp-banner";
import * as rename from "gulp-rename";
import * as watch from "gulp-watch";
import * as run from "gulp-run";
import * as connect from "gulp-connect";
import * as tslint from "tslint";
import gulpTslint from "gulp-tslint";
import * as ts from "gulp-typescript";
import * as runSequence from "run-sequence";
import * as pump from "pump";
import * as webpack from "webpack";
import * as gulpWebpack from "webpack-stream";
import * as UglifyJs from "uglifyjs-webpack-plugin";

const pkg          = require("./package.json");
const tsProject    = ts.createProject("./tsconfig.json", {outFile: `${pkg.name}.js`});
const comment      = `/*!
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
    .pipe(gulpTslint({program}))
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
      output: {filename: `${pkg.name}.min.js`},
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
    entry: "./js/tcupdate.js",
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
