const webpack = require("webpack");
const merge = require("webpack-merge");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const portfinder = require("portfinder");

const baseWebpackConfig = require("./webpack.base.conf");

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: "development",
    watch: true,
    devtool: "cheap-module-eval-source-map",
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = 4000;
    portfinder.getPortPromise().then(port => {
        process.env.PORT = port;
        devWebpackConfig.devServer.port = port;
        resolve(devWebpackConfig);
    }).catch(reason => reject(reason));
});
