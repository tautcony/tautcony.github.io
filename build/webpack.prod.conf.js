const webpack = require("webpack");
const merge = require("webpack-merge");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const portfinder = require("portfinder");

const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
    mode: "production",
});
