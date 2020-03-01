const webpack = require("webpack");
const merge = require("webpack-merge");

const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
    mode: "development",
    watch: true,
    devtool: "cheap-module-eval-source-map",
    plugins: [],
});
