const merge = require("webpack-merge").merge;

const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
    mode: "development",
    watch: true,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
    },
    devtool: "cheap-module-eval-source-map",
    plugins: [],
});
